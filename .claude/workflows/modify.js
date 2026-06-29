export const meta = {
  name: 'modify',
  description: '既存コード改修ハーネス — Planner → Generator (Backend/Frontend) → QA の3エージェントパイプライン',
  phases: [
    { title: 'Plan',     detail: '改修リクエストを詳細仕様に展開し harness/spec.md に書き出す' },
    { title: 'Backend',  detail: 'スプリントコントラクトに合意してからバックエンドを実装' },
    { title: 'Frontend', detail: 'スプリントコントラクトに合意してからフロントエンドを実装' },
    { title: 'QA',       detail: 'pytest + Playwright で動作検証。失敗時は修正ループ（最大3回）' },
    { title: 'Design',   detail: 'GAN型デザイン評価：Quality / Originality / Craft / Functionality の4軸スコアリングと修正ループ' },
  ],
}

// ─────────────────────────────────────────────
// 入力: args = "改修リクエスト（日本語）"
// 例: claude run modify --args "書籍にお気に入り機能を追加する"
// ─────────────────────────────────────────────

const request = typeof args === 'string' ? args : (args && args.request) || '改修内容が指定されていません'

const SPEC_SCHEMA = {
  type: 'object',
  properties: {
    title:          { type: 'string', description: '改修タイトル（一行）' },
    background:     { type: 'string', description: 'なぜこの改修が必要か（2〜3文）' },
    scope:          { type: 'string', enum: ['backend-only', 'frontend-only', 'full-stack'] },
    backend_tasks:  { type: 'array', items: { type: 'string' }, description: 'バックエンドで行う作業一覧' },
    frontend_tasks: { type: 'array', items: { type: 'string' }, description: 'フロントエンドで行う作業一覧' },
    db_changes:     { type: 'boolean', description: 'DB スキーマ変更（Alembicマイグレーション）が必要か' },
    new_endpoints:  { type: 'array', items: { type: 'string' }, description: '追加するAPIエンドポイント（例: POST /api/v1/books/{id}/favorite）' },
    acceptance:     { type: 'array', items: { type: 'string' }, description: '受入条件（ユーザー視点で箇条書き）' },
  },
  required: ['title', 'background', 'scope', 'backend_tasks', 'frontend_tasks', 'db_changes', 'new_endpoints', 'acceptance'],
}

const CONTRACT_SCHEMA = {
  type: 'object',
  properties: {
    sprint:       { type: 'string', enum: ['backend', 'frontend'] },
    deliverables: { type: 'array',  items: { type: 'string' }, description: 'このスプリントで作成・変更するファイル一覧' },
    success:      { type: 'array',  items: { type: 'string' }, description: 'QAが検証する具体的な成功基準' },
    out_of_scope: { type: 'array',  items: { type: 'string' }, description: 'このスプリントでは行わないこと' },
  },
  required: ['sprint', 'deliverables', 'success', 'out_of_scope'],
}

const QA_SCHEMA = {
  type: 'object',
  properties: {
    pass:     { type: 'boolean', description: '全成功基準をクリアしたか' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          result:    { type: 'string', enum: ['pass', 'fail', 'skip'] },
          detail:    { type: 'string' },
        },
        required: ['criterion', 'result', 'detail'],
      },
    },
    fix_hints: { type: 'array', items: { type: 'string' }, description: '失敗した場合の修正ヒント' },
  },
  required: ['pass', 'findings', 'fix_hints'],
}

const DESIGN_DIM_SCHEMA = {
  type: 'object',
  properties: {
    score:    { type: 'number', minimum: 1, maximum: 5, description: '1=最低, 5=最高' },
    rationale:{ type: 'string', description: 'スコアの根拠（具体的なコード箇所を含む）' },
    issues:   { type: 'array', items: { type: 'string' }, description: '改善すべき具体的な問題点' },
  },
  required: ['score', 'rationale', 'issues'],
}

const DESIGN_SCHEMA = {
  type: 'object',
  properties: {
    design_quality: {
      ...DESIGN_DIM_SCHEMA,
      description: 'Design Quality: 色・タイポグラフィ・レイアウト・余白が統一感のある全体像を形成しているか',
    },
    originality: {
      ...DESIGN_DIM_SCHEMA,
      description: 'Originality: テンプレートやAIデフォルト（白カード上の紫グラデ等）ではなく、意図的なデザイン判断の証拠があるか',
    },
    craft: {
      ...DESIGN_DIM_SCHEMA,
      description: 'Craft: タイポグラフィ階層・スペーシングの一貫性・色彩調和・コントラスト比などの技術的実行品質',
    },
    functionality: {
      ...DESIGN_DIM_SCHEMA,
      description: 'Functionality: ユーザーがUIの目的を理解し、主要アクションを見つけ、迷わずタスクを完了できるか',
    },
    overall_pass:     { type: 'boolean', description: '全4軸が3以上かつ致命的問題がない場合 true' },
    design_fix_hints: { type: 'array', items: { type: 'string' }, description: '最優先で修正すべき具体的な指示（コンポーネント名・Tailwindクラス・改善内容を含む）' },
  },
  required: ['design_quality', 'originality', 'craft', 'functionality', 'overall_pass', 'design_fix_hints'],
}

// ══════════════════════════════════════════════════════════
// Phase 1: PLANNER
// ══════════════════════════════════════════════════════════

phase('Plan')

log(`改修リクエスト受信: "${request}"`)

const spec = await agent(
  `あなたはシニアアーキテクトです。以下の改修リクエストを受け取り、開発チームが迷わず実装できる詳細仕様を作成してください。

## 改修リクエスト
${request}

## プロジェクト情報（CLAUDE.md より）
- FastAPI バックエンド: models / schemas / repositories / services / routers の5層構成
- React TypeScript フロントエンド: types/index.ts で型を一元管理
- 既存モデル: User, Book, Category, Location, LoanRecord
- API プレフィックス: /api/v1/
- DB変更時は Alembic マイグレーションが必要

## 作業
1. プロジェクトのコードベースを Read/Grep/Glob で調査し、既存実装との整合性を確認する
2. 改修に必要なバックエンド・フロントエンドのタスクを具体的に列挙する
3. 受入条件（ユーザーが何ができれば完了か）を明確にする
4. 仕様を harness/spec.md に書き出す

## harness/spec.md の書き方
- Markdown形式
- "# タイトル"、"## 背景"、"## バックエンドタスク"、"## フロントエンドタスク"、"## 受入条件" のセクション構成
- 具体的なファイル名・クラス名・メソッド名を含める

最後に構造化出力で仕様のサマリを返してください。`,
  { label: 'planner', phase: 'Plan', schema: SPEC_SCHEMA }
)

log(`仕様生成完了: ${spec.title} (scope=${spec.scope})`)
log(`バックエンドタスク: ${spec.backend_tasks.length}件 / フロントエンドタスク: ${spec.frontend_tasks.length}件`)

// ══════════════════════════════════════════════════════════
// Phase 2: BACKEND SPRINT
// ══════════════════════════════════════════════════════════

let backendContract = null
let frontendContract = null

if (spec.scope !== 'frontend-only') {
  phase('Backend')

  // 2-A: スプリントコントラクト合意
  backendContract = await agent(
    `あなたはテックリードです。次のバックエンドスプリントの「スプリントコントラクト」を作成してください。

## 改修仕様（Plannerより）
タイトル: ${spec.title}
バックエンドタスク:
${spec.backend_tasks.map(t => `- ${t}`).join('\n')}
新規エンドポイント:
${spec.new_endpoints.map(e => `- ${e}`).join('\n')}
DB変更: ${spec.db_changes ? 'あり（Alembicマイグレーション必要）' : 'なし'}

## コントラクトの要件
- deliverables: このスプリントで作成・変更するファイルを列挙（パスを含む）
- success: QAが実際に確認できる具体的な成功基準（「APIが200を返す」等）
- out_of_scope: 今スプリントでは対応しないことを明示

harness/sprint_contract_backend.md にも書き出してください。`,
    { label: 'contract:backend', phase: 'Backend', schema: CONTRACT_SCHEMA }
  )

  log(`バックエンドコントラクト合意: 成果物${backendContract.deliverables.length}件、成功基準${backendContract.success.length}件`)

  // 2-B: バックエンド実装
  await agent(
    `あなたはシニアバックエンドエンジニア（FastAPI/Python）です。
以下のスプリントコントラクトに従い、バックエンドを実装してください。

## スプリントコントラクト
成果物:
${backendContract.deliverables.map(d => `- ${d}`).join('\n')}

成功基準:
${backendContract.success.map(s => `- ${s}`).join('\n')}

スコープ外:
${backendContract.out_of_scope.map(o => `- ${o}`).join('\n')}

## 元の仕様
${spec.title}: ${spec.background}

## 実装ルール
- 必ず Read で既存ファイルを読んでから編集する
- 新規モデルは models/__init__.py にインポートを追加する
- DB変更後は alembic revision --autogenerate → alembic upgrade head を実行する
- 実装後に docker compose exec backend pytest tests/ -v でテストを実行する
- テスト失敗は必ず修正してからフェーズを終了する

実装が完了したら「BACKEND SPRINT COMPLETE」と返してください。`,
    { label: 'generator:backend', phase: 'Backend' }
  )

  log('バックエンドスプリント完了')
}

// ══════════════════════════════════════════════════════════
// Phase 3: FRONTEND SPRINT
// ══════════════════════════════════════════════════════════

if (spec.scope !== 'backend-only') {
  phase('Frontend')

  // 3-A: スプリントコントラクト合意
  frontendContract = await agent(
    `あなたはテックリードです。次のフロントエンドスプリントの「スプリントコントラクト」を作成してください。

## 改修仕様（Plannerより）
タイトル: ${spec.title}
フロントエンドタスク:
${spec.frontend_tasks.map(t => `- ${t}`).join('\n')}
新規エンドポイント（バックエンドで追加済み）:
${spec.new_endpoints.map(e => `- ${e}`).join('\n')}

## コントラクトの要件
- deliverables: 変更するファイルをパス付きで列挙
- success: ユーザーが UI 上で何ができれば成功かを具体的に（「〇〇ボタンを押すと...」）
- out_of_scope: 今スプリントでは対応しないことを明示

harness/sprint_contract_frontend.md にも書き出してください。`,
    { label: 'contract:frontend', phase: 'Frontend', schema: CONTRACT_SCHEMA }
  )

  log(`フロントエンドコントラクト合意: 成果物${frontendContract.deliverables.length}件、成功基準${frontendContract.success.length}件`)

  // 3-B: フロントエンド実装
  await agent(
    `あなたはシニアフロントエンドエンジニア（React/TypeScript/Tailwind）です。
以下のスプリントコントラクトに従い、フロントエンドを実装してください。

## スプリントコントラクト
成果物:
${frontendContract.deliverables.map(d => `- ${d}`).join('\n')}

成功基準:
${frontendContract.success.map(s => `- ${s}`).join('\n')}

スコープ外:
${frontendContract.out_of_scope.map(o => `- ${o}`).join('\n')}

## 元の仕様
${spec.title}: ${spec.background}

## 実装ルール
- 新規型定義は必ず src/types/index.ts に追加する（他のファイルに型を直書きしない）
- API呼び出しは src/services/ に対応するサービスファイルを作る or 既存ファイルに追加する
- 既存コンポーネントのスタイルに合わせる（Tailwind クラス、色使い）
- 実装後に cd frontend && npx tsc --noEmit で型チェックを実行する
- 型エラーは必ず修正してからフェーズを終了する

実装が完了したら「FRONTEND SPRINT COMPLETE」と返してください。`,
    { label: 'generator:frontend', phase: 'Frontend' }
  )

  log('フロントエンドスプリント完了')

  // ══════════════════════════════════════════════════════════
  // Phase 3.5: DESIGN REVIEW（GAN型評価ループ、最大2回）
  // ══════════════════════════════════════════════════════════

  phase('Design')

  let designResult
  let designAttempt = 0

  while (designAttempt < 2) {
    designAttempt++
    log(`デザイン評価 試行${designAttempt}/2 — Quality / Originality / Craft / Functionality`)

    designResult = await agent(
      `あなたはシニアUI/UXデザイナーです。フロントエンドの実装コードを読み、デザイン品質を厳しく評価してください。

## 評価対象
今回のフロントエンドスプリントで変更されたファイル:
${frontendContract.deliverables.map(d => `- ${d}`).join('\n')}

## 4軸評価基準（各1〜5点）

### 1. Design Quality（デザイン品質）
色・タイポグラフィ・レイアウト・余白・アイコンが統一感のある全体像を形成しているか。
パーツの寄せ集めではなく、1つの明確なムードやアイデンティティがあるか。
既存の書籍管理システムのデザインとの一体感も評価する。

### 2. Originality（独創性）
意図的なデザイン判断の証拠があるか。
以下は減点対象:
- 未加工のshadcn/UIやMUI等のストックコンポーネントをそのまま使用
- AIが生成しがちなパターン（白背景カードに紫グラデーションのバッジ、「ガラスモーフィズム」多用）
- Tailwind のデフォルトカラー（blue-500, gray-100 等）のみで構成された無個性なデザイン

### 3. Craft（技術的実行品質）
- タイポグラフィ: 見出し・本文・補足の階層が明確か
- スペーシング: padding/margin/gap が一貫しているか（8pxグリッドなど）
- 色彩調和: プライマリ・セカンダリ・ニュートラルのカラーロールが守られているか
- コントラスト比: テキストが読める色の組み合わせになっているか（WCAG AA相当）

### 4. Functionality（機能的ユーザビリティ）
- UIの目的がページタイトルやラベルから即座に理解できるか
- 主要アクション（CTAボタン等）が視覚的に際立っているか
- エラー状態・ローディング状態・空状態のハンドリングがあるか
- フォーム入力のバリデーションフィードバックが適切か

## 作業手順
1. Glob/Read で変更されたフロントエンドファイルを実際に読む
2. 既存コンポーネント（frontend/src/components/）も読み、スタイルの一貫性を確認する
3. 各軸を1〜5で採点し、具体的なコードの証拠（クラス名・行番号）を根拠に挙げる
4. overall_pass: 全軸が3以上かつ致命的UX問題がなければ true
5. design_fix_hints: スコアが低い軸について「〇〇コンポーネントの△△クラスを□□に変更」レベルの具体的指示

評価結果を harness/design_report.md に書き出してから、構造化出力で返してください。`,
      { label: `design-eval:attempt-${designAttempt}`, phase: 'Design', schema: DESIGN_SCHEMA }
    )

    const scores = [
      designResult.design_quality.score,
      designResult.originality.score,
      designResult.craft.score,
      designResult.functionality.score,
    ]
    const avg = (scores.reduce((a, b) => a + b, 0) / 4).toFixed(1)
    log(`デザイン評価 試行${designAttempt}: Quality=${scores[0]} Originality=${scores[1]} Craft=${scores[2]} Functionality=${scores[3]} (avg=${avg}) → ${designResult.overall_pass ? 'PASS' : 'FAIL'}`)

    if (designResult.overall_pass) break

    if (designAttempt < 2) {
      log(`デザイン修正フェーズ開始 (試行${designAttempt}/2)`)
      await agent(
        `あなたはシニアフロントエンドエンジニア（React/TypeScript/Tailwind）です。
デザイン評価エージェントから以下のフィードバックを受け取りました。指示に従い修正してください。

## デザイン評価スコア
- Design Quality: ${designResult.design_quality.score}/5 — ${designResult.design_quality.rationale}
- Originality: ${designResult.originality.score}/5 — ${designResult.originality.rationale}
- Craft: ${designResult.craft.score}/5 — ${designResult.craft.rationale}
- Functionality: ${designResult.functionality.score}/5 — ${designResult.functionality.rationale}

## 優先修正指示（最低スコアの軸から対処）
${designResult.design_fix_hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}

## 問題点詳細
Design Quality: ${designResult.design_quality.issues.join('; ')}
Originality: ${designResult.originality.issues.join('; ')}
Craft: ${designResult.craft.issues.join('; ')}
Functionality: ${designResult.functionality.issues.join('; ')}

## 修正ルール
- 修正後に cd frontend && npx tsc --noEmit で型チェックを実行する
- 既存ページとのスタイル一貫性を壊さない
- 修正が完了したら「DESIGN FIX COMPLETE」と返してください。`,
        { label: `design-fix:attempt-${designAttempt}`, phase: 'Design' }
      )
    }
  }

  log(`デザインフェーズ完了: ${designResult.overall_pass ? 'PASS' : 'FAIL (2回試行後も未解決)'}`)
}

// ══════════════════════════════════════════════════════════
// Phase 4: QA（最大3回の修正ループ）
// ══════════════════════════════════════════════════════════

phase('QA')

const allSuccess = [
  ...(backendContract ? backendContract.success : []),
  ...(frontendContract ? frontendContract.success : []),
  ...spec.acceptance,
]

let qaResult
let attempt = 0

while (attempt < 3) {
  attempt++
  log(`QA 検証 試行${attempt}/3 — ${allSuccess.length}件の成功基準を確認`)

  qaResult = await agent(
    `あなたは QA エンジニアです。スプリントコントラクトの成功基準をすべて検証し、レポートを作成してください。

## 確認する成功基準
${allSuccess.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## 検証方法
1. docker compose exec backend pytest tests/ -v でバックエンドテストを実行する
2. cd frontend && npx tsc --noEmit で型チェックを実行する
3. harness/sprint_contract_backend.md と harness/sprint_contract_frontend.md を読む
4. 実装されたファイルを Read で確認し、各基準が満たされているか判断する
5. Playwright MCP が使えない場合は、コードレビューとテスト結果で判断する

## レポートの書き出し先
検証結果を harness/qa_report.md に記録してください。
（試行回数、各基準の結果、総合判定を含める）

各成功基準について pass/fail/skip のいずれかで判定し、構造化出力で返してください。`,
    { label: `qa:attempt-${attempt}`, phase: 'QA', schema: QA_SCHEMA }
  )

  const failCount = qaResult.findings.filter(f => f.result === 'fail').length
  log(`QA 試行${attempt} 結果: ${qaResult.pass ? 'PASS' : `FAIL (${failCount}件失敗)`}`)

  if (qaResult.pass) break

  if (attempt < 3) {
    log(`修正フェーズ開始 (試行${attempt}/3)`)
    await agent(
      `あなたはシニアエンジニアです。QA が以下の問題を検出しました。修正してください。

## QA が失敗と判定した基準
${qaResult.findings
  .filter(f => f.result === 'fail')
  .map(f => `- 基準: ${f.criterion}\n  問題: ${f.detail}`)
  .join('\n')}

## 修正ヒント
${qaResult.fix_hints.map(h => `- ${h}`).join('\n')}

## 修正ルール
- 修正後は docker compose exec backend pytest tests/ -v と cd frontend && npx tsc --noEmit を実行する
- 修正が完了したら「FIX COMPLETE」と返してください。`,
      { label: `fix:attempt-${attempt}`, phase: 'QA' }
    )
  }
}

// ══════════════════════════════════════════════════════════
// 最終レポート
// ══════════════════════════════════════════════════════════

const qaStatus     = qaResult.pass                            ? '✓ PASS' : '✗ FAIL (3回試行後も未解決)'
const designStatus = !designResult || designResult.overall_pass ? '✓ PASS' : '✗ FAIL (2回試行後も未解決)'
log(`ハーネス完了 — ${spec.title}: QA=${qaStatus} / Design=${designStatus}`)

return {
  title:   spec.title,
  scope:   spec.scope,
  qa: {
    pass:     qaResult.pass,
    attempts: attempt,
    findings: qaResult.findings,
    fix_hints: qaResult.fix_hints,
  },
  design: designResult ? {
    pass:    designResult.overall_pass,
    scores: {
      design_quality: designResult.design_quality.score,
      originality:    designResult.originality.score,
      craft:          designResult.craft.score,
      functionality:  designResult.functionality.score,
    },
    fix_hints: designResult.design_fix_hints,
  } : null,
}
