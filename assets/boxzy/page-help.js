(() => {
  const guide = (selector, title, summary, rules, steps, errors) => ({ selector, title, summary, rules, steps, errors });
  const common = [
    guide('.boxzy-header .balance-add', '余额加号 · Deposit', '向 BOXZY 站内余额充值；点击“+”不会直接购买盒子。',
      ['$5 起充，单笔最高 $5,000；支付由 Coinflow 安全处理。', '成功后把入账金额加入原余额，并同步刷新所有页面的余额。'],
      ['点击“+”打开充值弹窗。', '选择快捷金额或输入金额，点击 Deposit；处理期间按钮锁定。', '成功页显示本次金额和最新余额，可关闭或直接返回盒子区。'],
      ['未登录：先完成验证，成功后自动恢复充值流程。', '空值、非数字或金额越界：不允许提交并显示具体原因。', '支付取消或失败：余额保持不变；处理中禁止关闭和重复提交。']),
    guide('.boxzy-header .account-button', 'My Account · 账户入口', '进入账户中心管理资金、地址、推荐码和账户状态。',
      ['按钮显示当前保存的用户名。', '打开账户页本身不会修改余额、收藏或登录数据。'],
      ['点击后进入 My Account；用户名修改后，顶部栏会读取新名称。'],
      ['未登录：先要求登录/手机号验证。', '账户数据读取失败：使用安全默认显示，不执行资金操作。']),
    guide('.boxzy-deposit-sheet .boxzy-amount-wrap', 'Deposit amount · 充值金额', '输入本次加入余额的美元金额。',
      ['$5–$5,000，只接受数字；最终以界面可见金额为准。'],
      ['可直接输入、点击快捷金额或使用数字键盘。'],
      ['空值、非数字或低于 $5：禁止提交。', '超过 $5,000：限制到最大值并提示。']),
    guide('.boxzy-deposit-sheet .boxzy-presets', 'Quick amounts · 快捷金额', '一键选择 $25/$50/$100/$250/$500。',
      ['快捷金额会替换当前输入，不会累加。'],
      ['选择后立即校验并刷新 Deposit 按钮状态。'],
      ['再次手动输入时，以最后显示的金额为准。']),
    guide('.boxzy-deposit-sheet .boxzy-keypad', 'Number pad · 数字键盘', '无需系统键盘即可输入或删除充值数字。',
      ['数字键追加字符，删除键移除最后一位。'],
      ['每次点击立即更新金额、错误和按钮状态。'],
      ['删除至空值时禁用提交；前导零会规范化。']),
    guide('.boxzy-deposit-sheet .boxzy-method', 'Coinflow · 支付方式', '显示本次充值使用的支付服务。',
      ['当前原型使用 Coinflow 安全结账，不在本页保存完整卡号。'],
      ['确认金额后使用该方式授权支付。'],
      ['授权取消或支付方式不可用：余额不变并允许重试。']),
    guide('.boxzy-deposit-sheet #boxzyDepositSubmit', 'Deposit · 确认充值', '按当前金额与付款方式提交充值。',
      ['成功后增加余额并触发全站余额刷新。'],
      ['点击后 Processing 约 0.9 秒，期间锁定关闭和重复提交。'],
      ['未登录先验证后自动恢复。', '金额无效或支付失败：不改余额并解除锁定。'])
  ];

  const pages = {
    'boxzy-interactive.html': [
      guide('.live-strip', 'Live Pulls · 实时开盒动态', '展示已经完成的近期抽取记录；它不是商品购买列表。',
        ['每条记录包含用户、商品、图片、抽中价值和时间。', '详情还会展示稀有度、市场参考价与来源盒子。', '历史记录可保留已下架商品，但不能把它当作仍可购买的库存。'],
        ['列表自动横向循环；悬停暂停。', '点击记录打开详情；×、遮罩或 Esc 关闭。', 'View box 进入该商品的来源盒子。'],
        ['无实时数据：使用预置记录避免空白。', '图片失败：保留名称、价值等文字。', '来源盒不可售：允许看历史详情，但阻止后续购买。']),
      guide('.approved-banner', '首页主视觉 · 盒子入口', '解释 BOXZY 的核心体验，并引导到下方盒子选择区。',
        ['本区域只负责说明和导航，不扣款、不随机抽奖。'],
        ['点击入口滚动到 Choose your box；不会自动选中任何盒子。'],
        ['图片失败时标题与入口仍可用。', '没有可售盒子时保留介绍，但购买入口应禁用。']),
      guide('.box-card[data-box="discovery"]', 'Starter Box · $39', '选择入门盒并查看独立奖池；当前点击不会扣款。',
        ['卡片价值范围是可能结果，不是保证回报。', '实际价格、概率和库存以详情页最终确认为准。'],
        ['点击卡片，或键盘 Enter/Space，进入 Starter Box 详情。', '在详情页再次点击 Buy now 才进入购买确认。'],
        ['不可售或无库存：仍可浏览详情，但不能确认购买。', '余额不足：不做部分扣款，提供充值入口。']),
      guide('.box-card[data-box="collector"]', 'Super Box · $89', '选择中阶盒并查看 $89 Super Box 的完整奖池。',
        ['首页卡片只选择盒型；不直接创建订单。', '价值范围不等于单次结果承诺。'],
        ['点击或按 Enter/Space 进入详情，再核对概率、数量与总价。'],
        ['库存变化以最终确认为准。', '余额不足时不扣款并引导充值。']),
      guide('.box-card[data-box="vault"]', 'Ultra Box · $179', '选择高阶盒并查看 $179 Ultra Box 的完整奖池。',
        ['高价值示例不代表必然抽中。', '实际结果由该盒当前奖池产生。'],
        ['点击或按 Enter/Space 进入详情；购买前再次确认数量和总价。'],
        ['盒子暂停或库存不足：禁止提交。', '余额不足：保留页面并提供 Deposit。'])
    ],
    'boxzy-box.html': [
      guide('#openBox', 'Buy now · 购买当前盒子', '进入购买确认；只有最终成功后才扣款并生成开盒结果。',
        ['盒型、单价和奖池由 URL 的 box 参数决定。', '总价按当前单价 × 数量计算。', '成功后随机生成一个奖池商品并加入 Collection。'],
        ['点击 Buy now，依次检查登录、库存和余额。', '确认后锁定按钮，防止双击订单。', '成功后展示抽中结果，可查看商品或收藏。'],
        ['未知 box 参数回退 Starter。', '余额不足、停售或库存不足：不扣款。', '已扣款但结果生成失败：回滚余额，不生成半成品订单。']),
      guide('.range-odds', 'Value range & odds · 价值与概率', '说明当前盒子的价值区间与各档位长期预计概率。',
        ['Min/Max 是当前奖池最低与最高参考价值。', '概率是长期分布，不保证单次结果或出现顺序。', '参考价会随市场更新。'],
        ['本区域只读；切换盒型后加载对应数据。'],
        ['四舍五入可能造成合计轻微尾差。', '奖池更新以购买确认时版本为准，历史订单不追溯。']),
      guide('.sort-wrap', 'Sort products · 奖池排序', '只改变 Possible products 的浏览顺序。',
        ['High/Low 按参考价值降序或升序。', '排序绝不改变中奖概率。'],
        ['选择后立即重排，无需保存。'],
        ['价值缺失的商品排在有明确价值的商品之后。']),
      guide('.product-grid', 'Possible products · 奖池商品', '展示当前盒子可能抽中的商品、参考价值与预计概率。',
        ['每张卡代表一个候选结果。', '参考价不是平台保证回购价。'],
        ['点击商品查看信息，不会直接购买该单件商品。'],
        ['图片缺失时保留名称、价值和概率。', '临时不可用商品从新订单奖池移除，但历史记录保留。'])
    ],
    'boxzy-collection.html': [
      guide('.tabs', 'Collection filters · 状态筛选', '按商品当前状态过滤收藏；标签数字是对应数量。',
        ['All 显示全部；Vault 显示平台保管中；Shipped 显示已发货。', '筛选不会更改或删除商品。'],
        ['点击后立即刷新列表，并保留当前排序。'],
        ['无结果：保留所选标签并显示空状态。', 'Ship/Sell 成功后数量与列表同步更新。']),
      guide('.sort-wrap', 'Collection sort · 收藏排序', '对当前筛选结果按时间或参考价值排序。',
        ['Newest first 按获得时间；High/Low 按价值。', '排序不修改商品数据。'],
        ['选择后立即重排，无需保存。'],
        ['估值缺失项排在有估值商品之后。']),
      guide('#collectionGrid', 'Collection item · 收藏商品', '每张卡是一件已抽中的商品，点击后进入具体操作。',
        ['Vault 商品可 Ship 或 Sell；Shipped 商品不能重复操作。', '卡片展示名称、状态、获得日期和当前参考价值。'],
        ['点击打开操作抽屉；关闭抽屉不改数据。'],
        ['状态已变化时刷新卡片并禁用旧操作。', '操作后与筛选不符的卡片自动移出当前视图。']),
      guide('#shipItem', 'Ship to me · 申请发货', '把当前 Vault 商品寄往默认地址；此按钮先进入费用确认。',
        ['必须有有效默认地址。', '运费 $9 + handling $2，合计 $11。', '成功后商品从 Vault 变为 Shipped。'],
        ['点击后先检查地址，再打开 $11 费用确认。'],
        ['无地址：引导新增。', '余额不足：不改状态并提供充值。', '重复请求或已发货：阻止；扣款后保存失败应退回 $11。']),
      guide('#sellItem', 'Sell · 回售商品', '按当前参考价值的 90% 把 Vault 商品回售给 BOXZY。',
        ['确认框展示参考价、90% 比例和最终入账金额。', '成功后金额加入余额，商品离开可操作 Vault。'],
        ['点击先预览报价；最终 Confirm sell 才执行。', 'Cancel 或关闭不改变任何数据。'],
        ['Shipped/已售商品不可回售。', '估值无效时禁用确认。', '入账或状态保存失败时两者都应回滚。']),
      guide('#payShipping', 'Pay $11 and ship · 最终发货', '最终支付 $11 并提交发货申请。',
        ['成功后扣余额、改为 Shipped，并刷新统计。'],
        ['点击后按钮锁定；完成前不能再次提交。'],
        ['余额不足不做部分扣款。', '默认地址无效则返回地址管理。', '重复请求只允许第一笔生效。']),
      guide('#confirmSell', 'Confirm sell · 最终回售', '按确认框报价把商品卖出并将金额加入余额。',
        ['执行价为操作时参考价值 × 90%。', '成功后顶部余额、统计和列表同步刷新。'],
        ['点击后锁定，成功提示前不接受第二次提交。'],
        ['报价失效或商品状态变化：取消并要求重新打开。', '写入失败：余额和商品都保持原状。'])
    ],
    'boxzy-leaderboard.html': [
      guide('.period-switch', 'Ranking period · 排名周期', '在 Today 与 This week 两套独立数据间切换。',
        ['切换会同时更新前三名、个人名次、完整榜单和开盒数。', '只查看数据，不会重置或领取奖励。'],
        ['点击按钮立即切换；高亮项是当前周期。'],
        ['无有效开盒显示未上榜。', '加载失败保留上一套完整数据，不能混合周期。']),
      guide('.countdown-card', 'Resets in · 结算倒计时', '显示当前榜单距离结算和重置的剩余时间。',
        ['每秒更新；归零时旧周期结算并开启新周期。'],
        ['切换周期后使用对应结算时间。'],
        ['设备时间异常以服务端为准。', '归零后新数据未返回时短暂保留旧榜并标记刷新。']),
      guide('.podium', 'Top 3 · 前三名', '展示当前周期拉取总价值最高的三位用户。',
        ['显示名次、用户名、开盒数、拉取价值与代表盒型。', '按有效订单汇总，不由单件最高商品直接决定。'],
        ['区域只读；切换周期同步重绘。'],
        ['并列按系统次级规则排序。', '不足三名时只展示已有用户。']),
      guide('.my-rank', 'My ranking · 我的名次', '即使不在可见榜单页，也显示当前账户的个人摘要。',
        ['使用与当前周期相同的统计口径。', '退款、取消和无效订单不计入。'],
        ['Open a box 返回首页参与新的有效开盒。'],
        ['未登录或无记录显示 Not ranked，不生成假名次。']),
      guide('.ranking-table', 'Full ranking · 完整榜单', '按顺序展示前三名以外用户的周期数据。',
        ['包含名次、开盒数、拉取价值和最佳盒型。'],
        ['切换周期后整表一次性重绘。'],
        ['刷新失败不显示半套结果。', '长用户名可省略显示，但仍关联原账户。'])
    ],
    'boxzy-account.html': [
      guide('[data-edit-user]', 'Edit username · 编辑用户名', '修改全站显示名，不影响余额、收藏和订单。',
        ['仅允许 3–16 位字母、数字或下划线。'],
        ['打开编辑框；校验通过后保存。', 'Cancel/关闭保留原名。'],
        ['空值、长度不符或非法字符：阻止保存并说明原因。', '保存失败保留输入，方便重试。']),
      guide('.balance-buttons [data-deposit]', 'Deposit · 账户充值', '向 BOXZY 余额加入 $5–$5,000。',
        ['成功后账户卡与顶部栏同时更新。', '当前支付服务为 Coinflow。'],
        ['选择金额后确认；处理中锁定按钮。'],
        ['越界、未登录或支付失败时余额不变。']),
      guide('[data-withdraw]', 'Withdraw · 提现', '提现金额会根据 Available balance 和当日剩余额度进行校验。',
        ['可提现余额可能小于总余额。', '提交前应展示金额、手续费、方式和预计时间。'],
        ['确认成功后创建记录，可在 Withdrawal history 查看。'],
        ['低于最低额、超过可提现额/日限额：禁止提交。', '失败时余额不变；处理中防重复。']),
      guide('[data-history]', 'Withdrawal history · 提现记录', '查看历史提现金额、时间和处理状态。',
        ['抽屉只读，不会再次发起提现。'],
        ['点击打开；×、遮罩或 Esc 关闭。'],
        ['无记录显示空状态。', '读取失败提示重试，不能误显示成“无记录”。']),
      guide('.address-link', 'Shipping address · 收货地址', '管理实体商品发货使用的地址。',
        ['可保存多条，但始终只有一个默认地址。'],
        ['点击进入 Shipping addresses。'],
        ['无有效默认地址时 Ship to me 必须先要求补充。']),
      guide('[data-copy-code]', 'Copy · 复制推荐码', '复制推荐码 UTOCV5，不包含账户隐私。',
        ['只写入推荐码文本。'],
        ['点击后写入剪贴板并显示反馈。'],
        ['剪贴板权限被拒绝时提示手动复制，不能显示假成功。']),
      guide('[data-support]', 'Customer support · 客服', '查看账户、支付、开盒和物流问题的联系方式。',
        ['当前邮箱：support@boxzy.com；打开弹窗不会自动发送数据。'],
        ['用户主动选择邮件入口后才离开页面。'],
        ['无邮件客户端时保留可复制邮箱。']),
      guide('[data-signout]', 'Sign out · 退出登录', '结束本机登录，不删除余额、收藏或地址。',
        ['只把认证状态改为未登录。'],
        ['先打开二次确认；Confirm 后退出。'],
        ['Cancel、关闭或 Esc 完整保留登录状态。']),
      guide('[data-delete]', 'Delete account · 删除账户', '永久清除原型中的余额、可提现额、用户名和地址。',
        ['确认框展示将放弃的当前余额。', '与退出不同，重新登录不会恢复已清除的本地数据。'],
        ['必须经过危险操作二次确认；成功后清除并跳转。'],
        ['Cancel/关闭/Esc 不改数据。', '清除任一步失败时不能显示删除成功。'])
    ],
    'boxzy-addresses.html': [
      guide('[data-address-open]', 'Add address · 新增地址', '新增实体商品的收货地址。',
        ['包含姓名、国家、街道、城市、州/省、邮编、电话和邮箱。', '第一条地址自动成为默认。'],
        ['打开空表单，填写必填项后保存。', 'Make default 会取消其他地址的默认状态。'],
        ['字段无效：阻止保存并聚焦首个错误。', 'Cancel、× 或遮罩：丢弃未提交输入。']),
      guide('[data-address-edit]', 'Edit · 编辑地址', '回填并修改当前地址，不创建重复记录。',
        ['可在保存时把它改为默认。'],
        ['修改后保存；关闭则保留原记录。'],
        ['校验失败不覆盖旧地址。', '记录已不存在时关闭并刷新列表。']),
      guide('[data-address-remove]', 'Remove · 删除地址', '从当前地址簿移除这条地址。',
        ['删除默认地址后，第一条剩余地址自动成为默认。', '删除最后一条后显示空状态。'],
        ['点击后移除目标并刷新列表。'],
        ['历史订单中的地址快照必须保留。', '目标不存在时不影响其他地址。']),
      guide('[data-address-form]', 'Save address · 保存表单', '校验并保存当前新增或编辑内容。',
        ['成功后关闭弹窗、更新列表和默认标记。'],
        ['提交后错误字段获得焦点。'],
        ['任何字段无效时不写入部分数据。', '重复点击只允许产生一条记录。'])
    ],
    'boxzy-deposit.html': [
      guide('.boxzy-amount-wrap', 'Deposit amount · 充值金额', '输入要加入余额的美元金额。',
        ['$5–$5,000，只接受数字。'],
        ['可直接输入、使用数字键盘或快捷金额。'],
        ['空值、非数字或低于 $5：禁止提交。', '超过 $5,000：限制到最大值并提示。']),
      guide('.boxzy-presets', 'Quick amounts · 快捷金额', '一键选择 $25/$50/$100/$250/$500。',
        ['点击会替换当前金额，不是累加。'],
        ['选择后立即校验并更新按钮状态。'],
        ['最终以界面最后可见金额为准。']),
      guide('.boxzy-keypad', 'Number pad · 数字键盘', '不调用系统键盘也能输入金额。',
        ['数字追加，删除键移除最后一位。'],
        ['每次点击立即刷新金额与错误。'],
        ['删除到空值时禁用提交；前导零会规范化。']),
      guide('.boxzy-method', 'Coinflow · 支付方式', '显示本次充值使用的支付服务。',
        ['当前原型使用 Coinflow 安全结账，不在此保存完整卡号。'],
        ['确认金额后用所选方式提交。'],
        ['方式不可用或授权取消：余额不变并允许重试。']),
      guide('#boxzyDepositSubmit', 'Deposit · 确认充值', '按当前金额和方式提交充值。',
        ['成功后增加余额并触发全站余额刷新。'],
        ['点击后 Processing 约 0.9 秒，期间锁定。'],
        ['未登录先验证后恢复。', '金额无效或支付失败：不改余额并解除锁定。'])
    ]
  };

  const page = location.pathname.split('/').pop() || 'boxzy-interactive.html';
  const configs = [...common, ...(pages[page] || [])];
  if (!configs.length) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const section = (title, list) => `<section class="boxzy-page-help-section"><h3>${title}</h3><ul>${list.map(text => `<li>${esc(text)}</li>`).join('')}</ul></section>`;

  const backdrop = document.createElement('div');
  backdrop.className = 'boxzy-page-help-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = `<section class="boxzy-page-help-panel" role="dialog" aria-modal="true" aria-labelledby="boxzyPageHelpTitle" tabindex="-1"><header class="boxzy-page-help-header"><div><div class="boxzy-page-help-kicker">FEATURE GUIDE · 功能说明</div><h2 class="boxzy-page-help-title" id="boxzyPageHelpTitle"></h2></div><button class="boxzy-page-help-close" type="button" aria-label="关闭功能说明">×</button></header><div class="boxzy-page-help-body"><p class="boxzy-page-help-intro"></p><div class="boxzy-page-help-sections"></div></div></section>`;
  document.body.append(backdrop);
  const panel = backdrop.querySelector('.boxzy-page-help-panel');
  const closeButton = backdrop.querySelector('.boxzy-page-help-close');
  const titleNode = backdrop.querySelector('.boxzy-page-help-title');
  const introNode = backdrop.querySelector('.boxzy-page-help-intro');
  const sectionsNode = backdrop.querySelector('.boxzy-page-help-sections');
  const markers = new Map();
  let returnFocus;
  let layoutFrame = 0;

  function open(config, marker) {
    titleNode.textContent = config.title;
    introNode.textContent = config.summary;
    sectionsNode.innerHTML = section('功能与数据规则', config.rules) + section('操作步骤与页面反馈', config.steps) + section('异常与边界处理', config.errors);
    returnFocus = marker;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    marker.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('boxzy-page-help-open');
    document.body.classList.add('boxzy-page-help-open');
    requestAnimationFrame(() => closeButton.focus());
  }
  function close() {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.boxzy-context-help-button[aria-expanded="true"]').forEach(node => node.setAttribute('aria-expanded', 'false'));
    document.documentElement.classList.remove('boxzy-page-help-open');
    document.body.classList.remove('boxzy-page-help-open');
    if (returnFocus?.isConnected) returnFocus.focus();
  }
  const interactiveTags = new Set(['BUTTON', 'A', 'SELECT', 'INPUT']);
  function positionInlineMarkers() {
    layoutFrame = 0;
    markers.forEach(({ target, marker, anchor, inline }) => {
      if (!inline || !target.isConnected || !anchor?.isConnected) return;
      const targetRect = target.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      marker.style.left = `${Math.round(targetRect.right - anchorRect.left - 10 + anchor.scrollLeft)}px`;
      marker.style.top = `${Math.round(targetRect.top - anchorRect.top - 9 + anchor.scrollTop)}px`;
    });
  }
  function scheduleLayout() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(positionInlineMarkers);
  }
  function reconcile() {
    markers.forEach(({ target, marker }) => {
      if (!target.isConnected) { marker.remove(); markers.delete(target); }
    });
    configs.forEach(config => document.querySelectorAll(config.selector).forEach(target => {
      if (target.closest('.boxzy-page-help-backdrop') || markers.has(target)) return;
      const marker = document.createElement('button');
      marker.className = 'boxzy-context-help-button';
      marker.type = 'button';
      marker.textContent = '?';
      marker.setAttribute('aria-label', `查看“${config.title}”完整说明`);
      marker.setAttribute('aria-haspopup', 'dialog');
      marker.setAttribute('aria-expanded', 'false');
      marker.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); open(config, marker); });
      let anchor = target;
      let inline = false;
      if (interactiveTags.has(target.tagName)) {
        marker.classList.add('boxzy-context-help-inline');
        anchor = target.parentElement || target;
        anchor.classList.add('boxzy-help-anchor');
        anchor.append(marker);
        inline = true;
      } else {
        target.classList.add('boxzy-help-anchor');
        target.append(marker);
      }
      markers.set(target, { target, marker, anchor, inline });
    }));
    scheduleLayout();
  }
  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
  document.addEventListener('keydown', event => {
    if (!backdrop.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = [...panel.querySelectorAll('button,a[href]')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', scheduleLayout);
  addEventListener('scroll', scheduleLayout, true);
  new MutationObserver(reconcile).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-hidden'] });
  reconcile();
})();
