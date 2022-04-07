const cn = {
  header: {
    header1: '兑换',
    header2: '流动性',
    header3: '连接钱包',
    header4: '首页',
    header5: '创建矿池/农场',
    header6: '文档',
    header7: '矿池',
    header8: '农场',
    header9: '浏览器',
    header10: '资产',
    header11: '共识',
    header12: '数据',
    header13: '区块链浏览器',
    header14: '* Nerve网络暂不支持硬件钱包'
  },
  footer: {
    footer1: '购买NVT',
    footer2: '开发者',
    footer3: '文档',
    footer4: '审计报告',
    footer5: '白皮书',
    footer6: '社区',
    footer7: '更多',
    footer8: '区块链浏览器',
    footer9: '创建节点',
    footer10: '网页钱包'
  },
  public: {
    public1: '资产',
    public2: '可用',
    public3: '锁定',
    public4: '总量',
    public5: '操作',
    public6: '账户',
    public7: '断开钱包',
    public8: '取消',
    public9: '确认',
    public10: '确认交易',
    public11: '充值金额',
    public12: '可用余额: ',
    public13: '已复制到剪切板',
    public14: '网络错误',
    public15: '手续费: ',
    public16: '余额: ',
    public17: '流动性不足',
    public18: '网络错误',
    public19: '暂无数据',
    public20: '高度',
    public21: '时间',
    public22: '状态',
    public23: '最近20条交易将显示在下方',
    public24: '连接网络错误'
  },
  error: {
    err_0001: '失败',
    err_0002: '未知错误',
    err_0003: '数据解析错误',
    err_0004: '线程名称重复',
    err_0005: '语言类型不能设置为空',
    err_0006: '流读写错误',
    err_0007: '数据大小错误',
    err_0008: '配置错误',
    err_0009: '签名错误',
    err_0010: '服务器拒绝访问',
    err_0011: '数据量太大，建议单个交易的数据大小为 ',
    err_0012: '参数错误',
    err_0013: '参数不能为空',
    err_0014: '数据错误',
    err_0015: '数据不存在',
    err_0016: '下载新版本数据错误',
    err_0017: '转换JSON数据错误',
    err_0018: '文件操作错误',
    err_0019: '序列化错误',
    err_0020: '反序列化错误',
    err_0021: '接口不存在',
    err_0022: '请求超时',
    err_0023: 'RPC请求失败',
    err_2009: '数据表已存在',
    err_2010: '数据表不存在',
    err_2011: '创建数据库区域异常',
    err_2012: '批量保存数据异常',
    err_2013: '数据保存错误',
    err_2014: '更新数据异常',
    err_2015: '查询数据异常',
    '10000': '成功',
    '10001': '失败',
    '10002': '系统错误',
    '10003': '数据解析错误',
    '10004': '线程名称冲突',
    '10005': '未设置语言',
    '10006': 'IO错误',
    '10007': '数据长度不正确',
    '10008': '错误的配置',
    '10009': '签名错误',
    '10010': '请求被拒绝',
    '10011': '数据长度过大',
    '10012': '参数错误',
    '10013': '参数不正确，有参数不能为空',
    '10014': '数据错误',
    '10015': '数据未找到',
    '10016': '下载版本文件失败',
    '10017': '解析JSON数据失败',
    '10018': '文件操作失败',
    '10019': '非法的访问',
    '10020': '实例化异常',
    '10035': '已是最新版本',
    '20000': '存储模块启动失败',
    '20001': '存储错误',
    '20002': 'Session未初始化',
    '20003': '有非法的空数据',
    '20004': '批量数据错误',
    '20005': '数据错误',
    '20006': '存储数据失败',
    '20007': '更新数据失败',
    '20008': '回滚数据失败',
    '20009': '数据表不存在',
    '20010': '数据表不存在',
    '20011': '建表数量超过限制',
    '20012': '建表失败',
    '20013': '建表路径错误',
    '20014': '删除表失败',
    '20015': '数据库批量操作关闭',
    '20023': '请求被拒绝',
    '30001': '区块头签名不正确',
    '30002': '区块头基本属性不合法',
    '30003': '区块基本属性不合法',
    '30004': '协议过大',
    '30005': '梅克尔根错误',
    '30006': '删除区块头错误',
    '30007': '交易回滚错误',
    '30008': '共识回滚通知错误',
    '30009': '协议存储通知错误',
    '30010': '共识存储通知错误',
    '30011': '交易保存错误',
    '30012': '区块头保存错误',
    ac_0000: '密码错误',
    ac_0001: '账户不存在',
    ac_0002: '账户已加密',
    ac_0003: '账户已存在',
    ac_0004: '地址错误',
    ac_0005: '别名已存在',
    ac_0006: '别名不存在',
    ac_0007: '账户已设置别名',
    ac_0008: '账户未加密',
    ac_0009: '别名已存在',
    ac_0010: '包含已加密的账户',
    ac_0011: '包含未加密的账户',
    ac_0012: '私钥格式不正确',
    ac_0013: '删除别名失败',
    ac_0014: '账户keystore不存在',
    ac_0015: '账户keystore已损坏',
    ac_0016: '别名格式错误',
    ac_0017: '密码格式错误',
    ac_0018: '账户加密失败',
    ac_0019: '账户已加密并锁定',
    ac_0020: '备注太长了',
    ac_0021: '输入太小了',
    ac_0022: '必须烧毁一个',
    ac_0023: '符号计数太大',
    ac_0024: '不是当前链地址',
    ac_0025: '是多重签名地址',
    ac_0026: '不是多重签名地址',
    ac_0027: '资产不存在',
    ac_0028: '余额不足',
    ac_0029: '余额不足',
    ac_0030: '链不存在',
    ac_0031: 'CoinData数据不完整',
    ac_0032: '交易不存在',
    ac_0033: '未找到交易coinData',
    ac_0034: '交易数据验证错误',
    ac_0035: '交易类型错误',
    ac_0036: '无效的交易或当前版本不可用',
    ac_0037: '交易数据太大',
    ac_0038: '交易转出人信息不存在',
    ac_0039: '交易转入人信息不存在',
    ac_0040: '链ID是错误的',
    ac_0041: '资产ID是错误的',
    ac_0042: '交易的签名地址不匹配',
    ac_0043: '已签署交易的地址',
    ac_0044: '交易有重复的帐户资产',
    ac_0045: '保存别名错误',
    ac_0046: '数量太小',
    ac_0047: '黑洞地址禁止发起交易',
    ac_0048: '远程数据响应错误',
    ac_0049: '交易支付金额不足',
    ac_0050: '只能有一个多重签名地址',
    ac_0051: 'CoinData不能有合约地址',
    ac_0052: '合约地址无法参与创建多签名帐户',
    ac_0053: '多重签名地址不能参与多重签名帐户的创建',
    ac_0054: '合约地址无法设置别名',
    ac_0055: '多重签名帐户不存在',
    ac_0056: '创建多重签名帐户失败',
    bl_0001: '链切换失败',
    bl_0002: '本地区块高度与网络高度不同',
    bl_0003: '初始化本地块时发生错误',
    bl_0004: '保存创世块时发生错误',
    bl_0005: '更新最新高度错误',
    bl_0006: '删除区块头错误',
    bl_0007: '交易回滚错误',
    bl_0008: '共识回滚错误',
    bl_0009: '协议保存错误',
    bl_0010: '共识保存错误',
    bl_0011: '交易保存错误',
    bl_0012: '保存区块头错误',
    bl_0013: '接收超出范围的块',
    bl_0014: '接收重复的主块',
    bl_0015: '接收分叉块',
    bl_0016: '接收无关块',
    bl_0017: '块验证错误',
    bl_0018: '块同步期间发生异常',
    cc_0001: '跨链交易的转入地址和转出地址不应该属于同一条链',
    cc_0002: '没有跨链交易的转出账户',
    cc_0003: '跨链交易转出账户不是相同的链账户',
    cc_0004: '跨链交易接收账户不是同一个链账户',
    cc_0005: '对不起，您的信用额度很低',
    cc_0006: '对于具有多签名帐户的跨链交易，只能有一个转出帐户。',
    cc_0007: '多签名帐户跨链交易转出帐户不是多签名帐户',
    cc_0008: '多签名帐户无法发布普通的跨链交易',
    cc_0009: '此帐户不是加密帐户',
    cc_0010: '跨链交易转出账户必须是本链账户',
    cc_0011: '信用值不足',
    cc_0012: '不能省略转出帐户和转入帐户。',
    cc_0013: '接口调用失败',
    cc_0014: '链不存在',
    cc_0015: '支付数据验证错误',
    cc_0016: '交易验证错误',
    cc_0017: '交易数据验证错误',
    cc_0018: '事务提交失败',
    cc_0019: '事务回滚失败',
    cc_0020: '不是跨链交易',
    cc_0021: '该链中未注册的跨链交易',
    cc_0022: '目标链中未注册的跨链交易',
    cc_0023: '资产在整个链中注册',
    cc_0024: '跨链网络不可用',
    cc_0025: '链未注册',
    cc_0026: '链未注册验证者信息',
    cc_0027: '交易签名的拜占庭验证错误',
    cc_0028: '跨链资产验证错误',
    cc_0029: '接收地址错误',
    cm_0001: '余额不够',
    cm_0002: '参数交易错误',
    cm_0003: '不是跨链交易',
    cm_0004: '参数错误',
    cm_1001: '已存在链ID',
    cm_1002: '链ID必须大于0',
    cm_1003: '未找到链',
    cm_1004: '链地址错误',
    cm_1005: '链状态不正确',
    cm_1006: '链资产超过1',
    cm_1007: '链魔法参数已经存在',
    cm_1008: '链名已经存在',
    cm_1009: '链验证列表为空',
    cm_1010: '拜占庭签名比率错误',
    cm_1011: '最大签名数量错误',
    cm_1012: '链地址前缀错误',
    cm_1013:
      '链一旦使用，想要改为禁用，您可以使用updatecrosschain cmd进行更新。',
    cm_1014: '链处于激活状态',
    cm_1015: ' ChainId:1 或 chainId:2 是系统链。',
    cm_2000: '资产简称不能为空',
    cm_2001: '资产简称长度必须小于5',
    cm_2002: '资产简称已存在',
    cm_2003: 'JSON传输失败',
    cm_2004: '恢复的资产必须超过0.9',
    cm_2005: '资产ID已存在',
    cm_2006: '资产名称不能为空',
    cm_2007: '资产名称长度必须小于20',
    cm_2008: '存款金额必须为200000',
    cm_2009: '资产初始化编号必须大于10000',
    cm_2010: '资产初始化编号必须小于100000000',
    cm_2011: '资产小数位数必须大于4',
    cm_2012: '资产小数位数必须小于8',
    cm_2013: '用于计算的链不是用于注册资产的链',
    cm_2014: '资产不存在',
    cm_2015: '资产编号超过初始化数量',
    cm_2016: '资产地址错误',
    cm_2017: '交易hash错误',
    cm_2018: '事务寄存器rpc调用错误',
    cm_2019: '分类帐余额rpc调用错误',
    cm_2020: 'Asset had already disable',
    cm_3000: '帐户验证错误',
    cm_3001: '帐号签名数据错误。',
    cs_0001: '数据错误',
    cs_0002: '交易不存在',
    cs_0003: '节点不存在',
    cs_0004: '数据不存在',
    cs_0005: '地址错误',
    cs_0006: '参数错误的',
    cs_0007: '打包地址不能与节点地址相同',
    cs_0008: '打包地址和奖励地址不能相同',
    cs_0009: '佣金超出范围',
    cs_0010: '保证金超出范围',
    cs_0011: '令牌数量错误',
    cs_0012: '交易数据验证错误',
    cs_0013: '节点存在',
    cs_0014: '已使用节点打包地址',
    cs_0015: '佣金比例太低',
    cs_0016: '重复交易',
    cs_0017: '超过可委托的最高金额',
    cs_0018: '小于最低保证金额',
    cs_0019: '数据添加失败',
    cs_0020: '数据回滚失败',
    cs_0021: '梅克尔根验证错误',
    cs_0022: '轮次数据验证失败',
    cs_0023: '信用不足',
    cs_0024: '链不存在',
    cs_0025: '红牌和黄牌交易错误',
    cs_0026: '区块签名错误',
    cs_0027: '红牌交易验证错误',
    cs_0028: '共识奖励验证错误',
    cs_0029: '验证交易列表是否为空',
    cs_0030: '远程方法调用失败',
    cs_0031: '帐户验证错误',
    cs_0032: '交易签名验证错误',
    cs_0033: '交易资产信息错误',
    cs_0034: '委托交易已从委托中撤回',
    cs_0035: '退出共识交易未确认',
    cs_0036: '尝试分叉',
    cs_0037: '双花',
    cs_0038: '获得太多黄牌',
    cs_0039: '冲突检测错误',
    cs_0040: '手续费不足',
    cs_0041: '解锁时间错误',
    lg_0001: '参数错误',
    lg_0002: '链初始化异常',
    lg_1001: '孤儿交易',
    lg_1002: '双花',
    lg_1003: '交易已存在',
    lg_1004: '余额不足',
    lg_1005: '发送的TX量小于接收量。',
    lg_1010: '失败',
    lg_1011: '资产默认设置错误',
    lg_1012: '资产符号错误',
    lg_1013: '资产名称错误',
    lg_1014: '地址错误',
    lg_1015: 'TX签名错误',
    lg_1016: 'TX RPC错误',
    nw_0001: '网络消息错误',
    nw_0002: '网络消息发送失败',
    nw_0003: '网络消息发送异常',
    nw_0004: '网络消息广播错误',
    nw_0005: '对等节点断开连接',
    nw_0006: '对等节点通道异常',
    pu_0001: '协议更新模块保存块错误',
    pu_0002: '协议更新模块回滚块错误',
    sc_0001: '合约执行错误',
    sc_0002: '合约地址不存在',
    sc_0003: '创建合约tx错误',
    sc_0004: '非法合约地址',
    sc_0005: '非合约交易',
    sc_0006: '非合约交易的资金不能转移到合约地址',
    sc_0007: '名称格式不正确',
    sc_0008: '非NRC20合约',
    sc_0009: '非查看方法',
    sc_0010: '非法合约代码',
    sc_0011: '重复的令牌名称',
    sc_0012: '符号的格式不正确',
    sc_0013: '合约已锁定',
    sc_0014: '小数值的范围为0到18',
    sc_0015: 'totalSupply的值范围为1到2 ^ 256  -  1',
    sc_0016: '价格的最小值是25',
    sc_0017: '当余额不为0时无法删除合约',
    sc_0018: '合约删除者必须是合约创建者',
    sc_0019: '合约已被删除',
    sc_0020: '超过合约调用的最大GAS限制',
    sc_0021: '不执行视图方法',
    sc_0022: '本合约不接受直接转入资产',
    sc_0023: '合约方法不存在',
    sc_0024: '无法锁定转移金额',
    sc_0025: '转移到合约地址的余额不足',
    sc_0026: '合约创建者不是交易创建者',
    sc_0027: '合约调用者不是交易创建者',
    sc_0028: '合约删除者不是交易创建者',
    sc_0029: '合约删除者不是合约创建者',
    sc_0030: '合约余额异常',
    sc_0031: '接收方不是合约地址。',
    sc_0032: '令牌余额不足',
    sc_0033: '不同的模块注册了重复的cmd',
    sc_0034: '接口不支持非字符串数组返回值',
    sc_0035:
      '非法操作，不能传输token，不能发送事件，不能内部转账，不能在内部调用合约，不能生成新交易',
    sc_0036: 'GAS值的范围是1到10,000,000',
    sc_0037: '代币的链条ID或资产ID错误。',
    sc_0038: '要发送的合约通证不为空。',
    sc_0039: '合约别名格式错误。',
    sc_0100: '余额不足',
    sc_0101: '交易手续费不正确',
    sc_0102: '转账金额太小',
    sc_0103: '交易不存在',
    sc_0104: '密码错误',
    sc_0105: '帐户不存在',
    sc_0106: '地址错误',
    sc_9999: '合约未知错误',
    tx_0001: '交易哈希错误',
    tx_0002: '地址与链不匹配',
    tx_0003: '地址与链不匹配',
    tx_0004: '未支付足够的手续费',
    tx_0005: '资产ID是错误的',
    tx_0006: '余额不存在',
    tx_0007: '余额不存在',
    tx_0008: '转出数据具有重复的帐户资产',
    tx_0009: '转入数据有重复的帐户资产',
    tx_0010: '转出数据不是同一个链',
    tx_0011: '转入数据不是同一个链',
    tx_0012: '未找到交易资产数据',
    tx_0013: '交易已存在',
    tx_0014: '交易不存在',
    tx_0015: '反序列化事务错误',
    tx_0016: '反序列化资产数据错误',
    tx_0017: '交易的签名地址与交易地址不匹配',
    tx_0018: '块高度更新在其余时间内无法重新打包',
    tx_0019: '包获取事务超时',
    tx_0020: '找不到链',
    tx_0021: '无效的交易或当前版本不可用',
    tx_0022: '交易数据验证错误',
    tx_0023: '交易数据太大',
    tx_0024: '帐户不存在',
    tx_0025: '交易账本验证失败',
    tx_0026: '孤儿交易',
    tx_0027: '重复交易',
    tx_0028: '未找到远程响应数据',
    tx_0029: '交易发送者不能有合约地址',
    tx_0030: '暂时停止处理新交易',
    tx_0031: '交易广播失败',
    tx_0032: '发送消息失败',
    tx_0033: '地址无效',
    tx_0034: '未达到多重签名帐户交易的最小签名数',
    tx_0035: '多重签名交易的发件人只有相同的多重签名地址',
    tx_0036: '不存在多重签名帐户',
    tx_0037: '交易验证失败',
    tx_0038: '合约交易验证失败',
    tx_0039: '交易已确认',
    tx_0043: '账户已被锁定'
  },
  home: {
    home1: '去中心化的数字资产服务网络',
    home2:
      '旨在打破孤立的区块链价值，建立跨链资产交换网络，为Defi应用生态提供一切必要的底层支持。让每一位数字资产持有者体验真正安全、免费、透明的 Defi 应用服务。',
    home3: '2秒确认，0 Gas Fee',
    home4: '支持超过8条链',
    home5: '进入兑换',
    home6: '进入Bridge',
    home7: '总交易量',
    home8: '最高APR',
    home9: '投资机构&合作伙伴',
    home10: '总流通量',
    home11: '总市值',
    home12: '质押量'
  },
  assets: {
    assets1: 'Layer2资产',
    assets2: '当前连接L1网络为: ',
    assets3: 'L2 ID: ',
    assets4: 'L1转入L2',
    assets5: 'L2转账',
    assets6: 'L2转至L1',
    assets7: '资产管理',
    assets8: '使用资产名称或ID进行查询',
    assets9: '使用资产名称或合约地址进行查询',
    assets10: '合约地址: '
  },
  transfer: {
    transfer1: '跨链转入',
    transfer2: '转账',
    transfer3: '跨链转出',
    transfer4: '从L1',
    transfer5: '账户充值',
    transfer6: '请输入NERVE/NULS地址',
    transfer7: '提现至L1',
    transfer8: '账户',
    transfer9: '确认充值',
    transfer10: '确认转账',
    transfer11: '确认提现',
    transfer12: '选择',
    transfer13: '资产授权',
    transfer14: '交易已发出，等待区块确认',
    transfer15: '余额不足',
    transfer16: '地址错误',
    transfer17: '金额必须为数字并且小数点后最多位数为',
    transfer18: '手续费不足',
    transfer19: '转账金额',
    transfer20: '提现金额',
    transfer21: '以太坊',
    transfer22: '使用其他资产',
    transfer23: '广播交易失败',
    transfer24: '请输入正确的NERVE/NULS地址',
    transfer25: '手续费不足'
  },
  trading: {
    trading1: '订单历史',
    trading2: '时间',
    trading3: '获得',
    trading4: '支付',
    trading5: '状态',
    trading6: '划点保护',
    trading7: '价格影响',
    trading8: '最低收到',
    trading9: '交易费用',
    trading10: '路由',
    trading11: '交易设置',
    trading12: '划点保护',
    trading13: '交易过期时间',
    trading14: '分钟',
    trading15: '最多卖出',
    trading16: '请填写0-100的数字',
    trading17: '交易流动性不足',
    trading18: '已确认',
    trading19: '仍然兑换',
    trading20: '价格影响很大',
    trading21: '兑换失败',
    trading22:
      '暂未开通该交易对智能路由，请兑换USDTN后再通过USDTN进行其余网络的USDT兑换'
  },
  liquidity: {
    liquidity1: '流动性',
    liquidity2: '增加流动性以获得LP代币',
    liquidity3: '增加流动性',
    liquidity4: '你的流动性',
    liquidity5: '详情',
    liquidity6: '退出',
    liquidity7: '添加流动性',
    liquidity8: '价格和资金池份额',
    liquidity9: '确认添加',
    liquidity10:
      '你是该交易对首位流动性的提供者，因此你首次加入池子 的Token比例会作为他们的初始价格',
    liquidity11: '占资金池比例',
    liquidity12: '创建流动性',
    liquidity13: '创建交易对',
    liquidity14: '创建交易对成功, 请添加流动性',
    liquidity15: '你将收到',
    liquidity16: '超过提供的流动性'
  },
  login: {
    login1: '请先生成L2地址',
    login2: '立即生成L2地址',
    login3: '生成L2地址失败: ',
    login4: '连接钱包'
  },
  farm: {
    farm1: '只看已质押',
    farm2: '收益',
    farm3: '年化收益',
    farm4: '流动性总价值',
    farm5: '剩余总奖励',
    farm6: '详情',
    farm7: '获得',
    farm8: '查看交易对信息',
    farm9: '已质押',
    farm10: '取回',
    farm11: '创建新的Farm',
    farm12: '创建Pool/Farm',
    farm13: '质押的Token资产',
    farm14: '解锁时间',
    farm15: '奖励的Token资产',
    farm16: '奖励的Token数量/天',
    farm17: '奖励Token总量',
    farm18: '我清楚创建Pool/Farm时，奖励给用户的Token将被立即转入',
    farm19: '确认创建',
    farm20: '添加',
    farm21: '收取',
    farm22: '开始时间',
    farm23: '已赚取',
    farm24: '进行中',
    farm25: '已结束'
  },
  createFarm: {
    createFarm1: '请选择质押的Token资产',
    createFarm2: '请设置解锁时间',
    createFarm3: '请选择奖励的Token资产',
    createFarm4: '请设置奖励的Token数量/天',
    createFarm5: '请设置奖励Token总量',
    createFarm6: '请设置开始时间',
    createFarm7: '请阅读并勾选复选框',
    // createFarm8: "请输入数字并且小数点后最多位数为",
    createFarm9: '请输入数字并且小数点后最多位数为',
    createFarm10: '当前账户可用余额不足',
    createFarm11: '请输入数字',
    createFarm12: '高级',
    createFarm13: '我的Pool/Farm:'
  },
  farmRankType: {
    apr: '按照收益排名',
    usd: '按照流动性排名'
  },
  staking: {
    staking0: '质押池',
    staking1: '质押享收益',
    staking2: 'Staking总奖励',
    staking3: '年化利率表',
    staking4: '币种',
    staking5: '活期',
    staking6: '3个月',
    staking7: '6个月',
    staking8: '12个月',
    staking9: '24个月',
    staking10: '36个月',
    staking11: '60个月',
    staking12: '120个月',
    staking13: '质押中',
    staking14: '操作记录',
    staking15: '高度',
    staking16: '数量',
    staking17: '期限',
    staking18: '节点类型',
    staking19: '累计收益',
    staking20: '加入时间',
    staking21: '到期时间',
    staking22: '操作',
    staking23: '转定期',
    staking24: '退出',
    staking25: '累计收益',
    staking26: '请选择币种',
    staking27: '请输入加入staking数量',
    staking28: '请选择期限',
    staking29: '收益估算',
    staking30: '继续收益',
    staking31: '年化收益率',
    staking32: '我的质押',
    staking33: '累计收益',
    staking34: '昨日收益',
    staking35: '操作时间',
    staking36: '批量退出',
    staking37: '批量转定期',
    staking38: '批量合并',
    staking39: '已选活期: ',
    staking40: '总计: ',
    staking41: '请至少选择2条活期项目',
    staking42: '该操作将会把多条质押记录合并为一条',
    staking43: '无法批量合并不同类型的资产',
    staking44: '不同类型的资产无法批量转定期',
    staking45: '全选',
    staking46: '交易详情',
    staking47: '该资产无法转定期',
    staking48: '退出的NVT将锁定7天',
    staking49: '质押金额必须最小为: ',
    staking50: '最大可用金额为: ',
    staking51: '此处为质押30天活期的预估收益',
    staking52: '操作',
    staking53: ' 条',
    staking54: '提示',
    staking55: '该资产没有可用余额',
    staking56: '请选择'
  },
  nodeType: {
    '1': '创建节点',
    '-1': '注销节点',
    '-2': '撤销保证金',
    '2': '追加保证金',
    '3': '加入Staking',
    '-3': '退出Staking'
  },
  stakingType: {
    undefined: '',
    TEST: '测试',
    NONE: '活期',
    THREE_MONTHS: '3月',
    HALF_YEAR: '半年',
    ONE_YEAR: '1年',
    TOW_YEARS: '2年',
    THREE_YEARS: '3年',
    FIVE_YEARS: '5年',
    TEN_YEARS: '10年'
  },
  nodeStatus: {
    undefined: '',
    '0': '全部节点',
    '1': '共识节点',
    '2': '虚拟银行',
    '3': '普通节点'
  },
  createNode: {
    createNode1: '创建节点',
    createNode2: '创建地址',
    createNode3: '奖励地址',
    createNode4: '打包地址',
    createNode5: '保证金',
    createNode6: '请输入奖励地址',
    createNode7: '请输入打包地址',
    createNode8: '打包地址不能为创建地址',
    createNode9: '请输入保证金',
    createNode10: '请输入正确的奖励地址',
    createNode11: '打包地址不能为奖励地址',
    createNode12: '请输入正确的打包地址',
    createNode13: '保证金必须数字值',
    createNode14: '余额不足',
    createNode15: '保证金不小于200000且不大于100000000',
    createNode16: '创建地址有过红牌惩罚不能再创建节点'
  },
  nodeDetail: {
    nodeDetail1: '注销节点',
    nodeDetail2: '全网节点',
    nodeDetail3: '共识中',
    nodeDetail4: '待共识',
    nodeDetail5: '总奖励',
    nodeDetail6: '年化收益率',
    nodeDetail7: '信用值',
    nodeDetail8: '节点类型',
    nodeDetail9: '节点惩罚',
    nodeDetail10: '创建时间',
    nodeDetail11: '创建者别名',
    nodeDetail12: '黄牌',
    nodeDetail13: '退出保证金',
    nodeDetail14: '追加保证金',
    nodeDetail15: '委托金额',
    nodeDetail16: '退出金额',
    nodeDetail17: '委托金额不能为空',
    nodeDetail18: '请输入有效的委托金额数值',
    nodeDetail19: '节点的最低委托量为2000',
    nodeDetail20: '最大可用金额为:',
    nodeDetail21: '退出金额不能为空',
    nodeDetail22: '请输入有效的退出金额数值',
    nodeDetail23: '最少退出为2000',
    nodeDetail24: '可退数量为:'
  },
  transferType: {
    undefined: '',
    '2': '普通转账',
    '4': '创建节点',
    '5': '加入Staking',
    '6': '退出Staking',
    '9': '注销节点',
    '28': '追加保证金',
    '29': '撤销保证金',
    '32': '批量退出 Staking',
    '33': '合并交易',
    '43': '跨链转出',
    '61': '创建Swap交易对',
    '63': 'Swap交易',
    '64': '添加Swap流动性',
    '65': '撤销Swap流动性',
    '66': '质押挖矿',
    '67': '退出质押'
  },
  info: {
    info1: '总览',
    info2: '池子',
    info3: '资产',
    info4: '流动性',
    info5: '交易量',
    info6: '通过池子或代币进行搜索',
    info7: '资产排名',
    info8: '名称',
    info9: '价格',
    info10: '价格变化',
    info11: '24H交易量',
    info12: '7D交易量',
    info13: '24H LP奖励费',
    info14: 'LP奖励APR',
    info15: '你的观察列表',
    info16: '全部池子',
    info17: '添加流动性',
    info18: '交易',
    info19: '代币总锁定',
    info20: '全部',
    info21: '兑换',
    info22: '增加',
    info23: '移除',
    info24: '操作',
    info25: '总价值',
    info26: '代币数量',
    info27: '账户',
    info28: '时间',
    info29: '在浏览器中查看',
    info30: '24H交易次数',
    info31: '池子排名',
    info32: '全部资产',
    info33: '搜索池子或代币',
    info34: '交易量'
  }
};

export default cn;
