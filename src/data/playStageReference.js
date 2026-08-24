// 真实戏曲舞台设计参考库
// 原则：固定舞台结构不变，只添加/替换可变元素（灯光、投影、可移动道具）

export const fixedStageStructures = {
  traditional: [
    '底幕（守旧）或固定天幕：作为背景基础，不可更换整体结构',
    '台口镜框或伸出式台口：剧场建筑固定结构',
    '侧幕条（上下场门）：固定遮掩区域，可变换色彩但位置固定',
    '台毯/舞台地面：固定铺设，可在其上叠加局部地毯',
    '基本灯位系统：面光、耳光、顶光、逆光固定吊挂点位',
    '一桌二椅基础组合：戏曲通用核心道具，位置可调但形制固定',
  ],
  modern: [
    'LED大屏主背景框架：固定安装，播放内容可更换',
    '基础舞台地台/升降台：机械结构固定，通过灯光和投影改变视觉效果',
    '固定灯架桁架：吊装点位固定，通过换色片、调光改变氛围',
    '侧屏/耳屏：边框固定，播放戏曲意境画面',
    '基础面光/耳光系统：保证演员面部照明的固定灯位',
  ],
};

export const playStageReferences = [
  {
    id: 'yueju-wodedaguanyuan',
    names: ['我的大观园', '大观园', '贾宝玉', '红楼'],
    genre: 'yueju',
    creators: { stage: '胡艳君', lighting: '萧丽河', multimedia: '胡天骥', costume: '李昆' },
    venue: '浙江音乐学院大剧院、蝴蝶剧场',
    year: '2025',
    performanceCredits: [
      '主演：陈丽君 饰 贾宝玉（尹派小生）',
      '主演：何青青 饰 林黛玉（王派花旦）',
      '演出单位：浙江小百花越剧院',
      '导演：郭小男',
      '首演时间：2025年1月',
      '巡演：2025年全国巡演，北京、上海、杭州等',
    ],
    characters: [
      { name: '贾宝玉', roleType: '小生', costumeRef: '尹派白色缎面长衫，金线刺绣，参考李昆设计浙江小百花2025版', historicalBasis: '清代男子便服，长衫配马褂，贵族公子装束' },
      { name: '林黛玉', roleType: '花旦', costumeRef: '淡蓝百折裙，云肩配流苏，参考王派花旦传统扮相', historicalBasis: '清代汉族女子袄裙，小姐日常装束，淡雅色系' },
      { name: '十二钗', roleType: '群旦', costumeRef: '各色闺阁裙装，参考李昆设计的"褪去颜色"冷光效果', historicalBasis: '清代仕女画中的女子群像服饰' },
    ],
    historicalBasis: '改编自《红楼梦》，清代乾隆年间成书。服饰依据故宫博物院藏清代服饰及《清稗类钞》记载。',
    referenceImagePrompt: 'Yue Opera "My Grand View Garden" 2025 stage, Chen Lijun performance, three-tier stepped platform with golden ratio layout, movable lattice screens, ink-wash projection backdrop, Xiao Lihe lighting design, elegant and modern Chinese opera stage, warm stage lighting',
    fixedStructure: [
      '镜框式舞台基础台口',
      '三层阶梯式平台（黄金分割纵向布局）',
      '可多层次升降旋转的机械台阶（18层台阶用于"滚楼梯"片段）',
      '多扇花窗式屏幕（机关化横向移动）',
    ],
    variableElements: {
      lighting: [
        '萧丽河设计：太虚幻境中使用特殊色温让十二钗服装"褪去颜色"的冷光效果',
        '四季流转光效：春（嫩绿暖白）、夏（明艳金黄）、秋（橙红侧光）、冬（冷蓝聚光）',
        '宝玉大婚场景：大面积红色饱和光+局部追光形成强烈对比',
        '雪花飘落场景：冷白顶光+地面反光营造"白茫茫"意境',
        '老年宝玉回望：低色温暖光+长阴影',
      ],
      projection: [
        '胡天骥多媒体：水墨山水、花影斑驳的主背景投影（非实体景片）',
        '"镜花水月"地面投影效果（仅在台毯/地面投射，不改变地板结构）',
        '轻烟薄雾的多媒体叠加层（雾气机+低亮度投影）',
        '虚实交织的园林花窗投影（配合实体花窗屏幕）',
      ],
      props: [
        '可移动吊桥装置（带滚轮，可推入推出）',
        '台中台小型表演区（组装式平台，非固定）',
        '飘落雪花装置（材质轻便，悬挂于固定吊点）',
      ],
      colorPalette: ['红白对比（大喜大悲/婚礼场景）', '水墨灰蓝（日常/太虚幻境）', '暖金（元春省亲）', '冷白（结局/雪花）'],
    },
    designSuggestions: [
      '【固定结构保留】保留三层阶梯平台和花窗屏幕框架，这是《我的大观园》辨识度最高的舞台结构',
      '【灯光可变】通过LED染色灯和换色片实现"四季流转"，同一场地白天排戏、晚上演出可快速切换色调',
      '【投影内容可变】将实体山水布景改为投影：荣宁府邸（暖调建筑线条）、太虚幻境（水墨云雾）、戏台（勾栏瓦舍图案）三种多媒体模板',
      '【可移动道具】吊桥和台中台使用带锁万向轮，可在15分钟内完成场景切换',
      '【符合实际】不拆除阶梯平台，仅在台阶立面粘贴不同主题的可移除画面（省亲用皇家纹样、日常用花卉图案）',
    ],
  },
  {
    id: 'yueju-liangzhu',
    names: ['梁山伯与祝英台', '梁祝', '化蝶', '十八相送'],
    genre: 'yueju',
    creators: { stage: '郭小男版/浙江小百花', lighting: '传统越剧灯光', multimedia: '新版加入多媒体' },
    venue: '琴台大剧院、西九文化区戏曲中心',
    year: '2025-2026',
    performanceCredits: [
      '主演：陈丽君 饰 梁山伯（尹派小生）/ 李云霄 饰 祝英台（袁派花旦）',
      '演出单位：浙江小百花越剧院',
      '导演：郭小男',
      '演出时间：2025-2026年巡演',
      '经典版本：1953年袁雪芬、范瑞娟版电影为基底',
    ],
    characters: [
      { name: '梁山伯', roleType: '小生', costumeRef: '越剧小生褶子，淡蓝或白色，参考浙江小百花2025版', historicalBasis: '东晋时期士人服饰，宽袖长衫，儒雅风格' },
      { name: '祝英台', roleType: '花旦', costumeRef: '女扮男装时：小生装；女装：百折裙+云肩，参考袁派花旦传统', historicalBasis: '东晋女子袄裙，少女装束以淡雅为主' },
    ],
    historicalBasis: '东晋时期（317-420年）民间传说，最早见于唐代《宣室志》。服饰参考东晋士人装束及越剧袁派、尹派传统戏服规制。',
    referenceImagePrompt: 'Yue Opera "Butterfly Lovers" stage, 2025 Zhejiang Xiaobaihua version, traditional proscenium stage, delicate folding fan motif, soft pastel lighting, spring garden atmosphere, Jiangnan water-town aesthetic, elegant Chinese opera set',
    fixedStructure: [
      '传统越剧镜框舞台',
      '基础侧幕条和底幕',
    ],
    variableElements: {
      lighting: [
        '草桥结拜：柔和暖黄面光+天幕淡绿（春天气息）',
        '十八相送：流动的追光模拟路途，侧光渐变（模拟时间流逝）',
        '楼台会：冷暖对比光（梁祝二人分处不同光区）',
        '化蝶：蓝紫梦幻光+频闪花瓣光点',
        '全剧终场：全场暖金光亮起，象征爱情升华',
      ],
      projection: [
        '新版以"扇"喻蝶：背景投影扇面图案（可替换内容）',
        '花瓣飘落多媒体效果（终场配合实体花瓣机）',
        '水磨调意境：淡雅水墨投影作为底幕内容',
      ],
      props: [
        '折扇（核心手持道具，贯穿全剧）',
        '蝴蝶形吊饰（可悬挂于固定吊点）',
        '简易折叠屏风（用于楼台相会分隔空间）',
        '花瓣飘洒装置（终场使用）',
      ],
      colorPalette: ['粉蓝梦幻（化蝶）', '暖黄翠绿（相送）', '红白对比（哭坟/抗婚）', '淡金（草桥结拜）'],
    },
    designSuggestions: [
      '【固定结构保留】传统越剧舞台无需复杂机械装置，保持底幕和基础台口',
      '【核心可变元素：扇】以折扇为视觉母题：背景LED可投影放大的扇面水墨画，演员手持实物折扇呼应',
      '【灯光叙事】利用灯光色温变化推动情感：从春日的暖绿到楼台的冷暖对峙，再到化蝶的蓝紫梦幻',
      '【低成本可变】若预算有限，仅更换底幕投影内容+灯光色纸即可实现场景转换',
      '【花瓣效果】终场使用实体花瓣机（舞台固定吊点悬挂）配合天幕暖光，营造"化蝶"氛围',
    ],
  },
  {
    id: 'yueju-shangxuelou',
    names: ['上西楼', '李清照', '声声慢', '宋词'],
    genre: 'yueju',
    creators: { stage: '胡艳君', lighting: '卢卫东', multimedia: '胡天骥', costume: '李昆' },
    venue: '杭州蝴蝶剧场、宁波文化广场大剧院',
    year: '2024',
    performanceCredits: [
      '主演：陈丽君 饰 李清照（女小生反串）',
      '主演：李云霄 饰 赵明诚',
      '演出单位：浙江小百花越剧院',
      '导演：郭小男',
      '首演时间：2024年9月',
      '巡演：2024-2025年全国巡演',
    ],
    characters: [
      { name: '李清照', roleType: '女小生', costumeRef: '宋代文人长衫，素雅色调，参考李昆设计陈丽君版', historicalBasis: '宋代士人服饰，直裾或曲裾，文人墨客装束' },
      { name: '赵明诚', roleType: '小生', costumeRef: '宋代官服或便服，儒雅风格，参考尹派小生传统', historicalBasis: '宋代文官服饰，幞头配圆领袍' },
    ],
    historicalBasis: '宋代（1084-1155年）李清照生平故事。服饰依据故宫博物院藏宋代服饰及《宋史·舆服志》记载。',
    referenceImagePrompt: 'Yue Opera "Upstairs West" stage, 2024 Zhejiang Xiaobaihua version, Chen Lijun Li Qingzhao, Song dynasty scholar aesthetic, minimalist stage with calligraphy backdrop, warm amber lighting, elegant Jiangnan literati atmosphere',
    fixedStructure: [
      '镜框式舞台基础台口',
      '书法屏风背景框架',
      '可移动书案道具平台',
    ],
    variableElements: {
      lighting: [
        '书房场景：暖黄柔光+局部顶光（书卷气）',
        '南渡流亡：冷蓝侧光+烟雾（凄凉感）',
        '醉酒填词：旋转追光+彩色光斑（迷幻）',
        '终场《声声慢》：全场冷白光+落叶投影',
      ],
      projection: [
        '书法背景：李清照词作投影（可更换内容）',
        '四季意象：落花、飞雪、梧桐雨投影',
        '金石文物：青铜器、石碑拓片投影',
      ],
      props: [
        '书案（带文房四宝）',
        '古琴（李清照弹奏场景）',
        '青铜香炉（营造氛围）',
        '书卷和笔墨纸砚',
      ],
      colorPalette: ['墨青（书卷气）', '暖黄（温馨）', '冷蓝（凄凉）', '素白（极简）'],
    },
    designSuggestions: [
      '【固定结构保留】书法屏风框架是核心视觉元素，保留此结构',
      '【核心可变：词意投影】将李清照词作投影于屏风，配合灯光变化',
      '【道具极简】仅用一桌一椅一书案，以演员表演为主',
      '【灯光叙事】用色温变化表达李清照人生起伏：从暖黄少女到冷蓝晚年',
      '【符合实际】不添加复杂景片，保持舞台空灵，突出宋词意境',
    ],
  },
  {
    id: 'qinqiang-dajiaozan',
    names: ['打焦赞', '杨排风', '演火棍'],
    genre: 'qinqiang',
    creators: { stage: '陕西省戏曲研究院传统舞美', lighting: '传统秦腔灯位' },
    venue: '陕西省戏曲研究院剧场',
    year: '传统剧目/2026年因电视剧《主角》热播复排',
    performanceCredits: [
      '主演：杨排风（武旦）',
      '演出单位：陕西省戏曲研究院',
      '电视剧《主角》（2026年央视热播）中作为戏中戏呈现',
      '传统秦腔武戏经典，源自《杨家将》故事',
      '经典版本：马蓝鱼、李瑞芳等前辈艺术家版本',
    ],
    characters: [
      { name: '杨排风', roleType: '武旦', costumeRef: '秦腔武旦靠装，红白为主，插靠旗，参考陕西省戏曲研究院传统扮相', historicalBasis: '宋代武将戎装，靠旗、铠甲元素，源于清代戏曲武旦规制' },
      { name: '焦赞', roleType: '花脸', costumeRef: '秦腔花脸黑靠，脸谱勾画，参考传统秦腔净角扮相', historicalBasis: '宋代武将装束，戏曲净角传统脸谱和铠甲' },
    ],
    historicalBasis: '北宋时期杨家将故事。杨排风为虚构人物，原型为杨家将传说中的烧火丫头。服饰参考宋代戎装及秦腔传统武戏服装规制。',
    referenceImagePrompt: 'Qinqiang Opera "Defeating Jiao Zan" stage, Shaanxi Provincial Traditional Opera Research Institute, traditional open stage for martial arts, red and black warrior costumes, burning fire stick prop, bold Qinqiang theatrical lighting, empty stage floor for acrobatics',
    fixedStructure: [
      '秦腔传统舞台台口',
      '底幕（守旧）',
      '基础面光和顶光系统',
      '一桌二椅（武戏中可作为校场检阅台）',
    ],
    variableElements: {
      lighting: [
        '校场比武：高亮度白光+强烈侧光（突出武旦身段和烧火棍花）',
        '出征场面：红色侧逆光营造战场氛围',
        '天波府场景：暖黄面光（室内感）',
        '杨排风亮相：追光紧跟，突出主角',
      ],
      projection: [
        '校场背景：简洁的军帐/旌旗图案投影（不宜复杂，以免影响武戏观看）',
        '三关场景：远山剪影投影（极简，留出表演空间）',
      ],
      props: [
        '烧火棍（核心道具，武旦棍花表演）',
        '马鞭（代表骑马行军）',
        '简易军帐（可折叠布幕，带框架）',
        '锣鼓架（秦腔武戏特色，配合打击乐）',
      ],
      colorPalette: ['大红（秦腔主调）', '黑白对比（武戏服装）', '金黄（杨排风戏服点缀）'],
    },
    designSuggestions: [
      '【固定结构保留】秦腔武戏舞台以"空"为主，固定底幕和基本灯位即可',
      '【核心原则：留出武打空间】《打焦赞》以棍花、跟头、武打为主，不可添加过多实体景片，会妨碍演员动作',
      '【可变元素仅限】可移动的简易军帐（折叠式）、更换底幕投影（校场/军帐两种即可）',
      '【灯光重点】用强烈追光和侧逆光突出武旦的烧火棍表演，这是该剧最大的视觉看点',
      '【符合实际】千万不要加复杂台阶或吊桥！武戏需要平整开阔的舞台地面供演员翻打',
    ],
  },
  {
    id: 'qinqiang-yangmennvjiang',
    names: ['杨门女将', '穆桂英', '佘太君', '探谷'],
    genre: 'qinqiang',
    creators: { stage: '陕西省戏曲研究院', lighting: '秦腔传统灯位+现代补充' },
    venue: '陕西省戏曲研究院',
    year: '传统经典',
    performanceCredits: [
      '主演：佘太君（老旦）、穆桂英（武旦）',
      '演出单位：陕西省戏曲研究院',
      '电视剧《主角》（2026年）中作为经典剧目呈现',
      '经典版本：马蓝鱼版佘太君、王玉琴版穆桂英',
      '原京剧剧目，移植为秦腔后成为西北经典',
    ],
    characters: [
      { name: '佘太君', roleType: '老旦', costumeRef: '秦腔老旦蟒袍或帔，深蓝或墨绿，参考王玉琴传统扮相', historicalBasis: '宋代诰命夫人服饰，戏曲老旦传统扮相，凤冠霞帔元素' },
      { name: '穆桂英', roleType: '武旦', costumeRef: '女靠装，红缎为主，靠旗四面，参考马蓝鱼版', historicalBasis: '宋代女将装束，戏曲女靠规制，源于清代京剧武旦传统' },
      { name: '杨七娘', roleType: '武旦', costumeRef: '武旦靠装或改良靠，参考秦腔传统武旦服饰', historicalBasis: '杨家将故事中人物，服饰参照穆桂英女靠规制' },
    ],
    historicalBasis: '北宋杨家将故事，原型为杨业家族。佘太君原型为折太君，穆桂英为虚构人物。服饰参考宋代戎装及清代戏曲女靠规制。',
    referenceImagePrompt: 'Qinqiang Opera "Women Generals of Yang Family" stage, Shaanxi Provincial Traditional Opera Research Institute, classic Chinese opera martial stage, red and gold warrior costumes, grand military camp atmosphere, traditional Qinqiang theatrical lighting',
    fixedStructure: [
      '秦腔舞台基础台口',
      '底幕',
      '固定灯位（面光、顶光）',
    ],
    variableElements: {
      lighting: [
        '校场点兵：大面积暖红光+金色侧光（气势恢宏）',
        '探谷场景：冷蓝绿光+雾效（营造深谷险境）',
        '灵堂场景：低照度冷白光（肃穆）',
        '出征场景：追光+旌旗逆光剪影',
      ],
      projection: [
        '校场：将台/旌旗图案（简洁，不抢戏）',
        '探谷：山石峭壁投影（纵深错觉）',
        '战场：硝烟效果（烟机+低亮度投影）',
      ],
      props: [
        '点将台（一桌二椅加高台布）',
        '马鞭、兵器架（武戏必备）',
        '灵堂素幔（白色可拆卸布幔）',
        '靠旗（演员背饰，非舞台装置）',
      ],
      colorPalette: ['大红（点兵/出征）', '素白（灵堂）', '深绿（探谷）', '金黄（女将服饰）'],
    },
    designSuggestions: [
      '【固定结构】秦腔传统舞台，保持基础台口和底幕',
      '【重点场次：探谷】这是《杨门女将》秦腔版最经典的段落。可通过冷色侧光+烟雾机营造"峡谷"氛围，无需实体山石景片',
      '【可变道具】点将台使用加高台毯覆盖现有桌椅，出征时撤除，灵堂时悬挂白色素幔——均在固定结构上叠加',
      '【灯光分色】用灯光冷暖区分情绪：校场暖红（热血）、灵堂冷白（哀思）、探谷冷绿（险境）',
      '【符合实际】不要建造实体将台！用现有桌椅+台毯覆盖即可，保证武戏时快速撤除',
    ],
  },
  {
    id: 'jingju-muguiyingguashuai',
    names: ['穆桂英挂帅', '捧印', '杨家将'],
    genre: 'jingju',
    creators: { stage: '国家京剧院一团', director: '传统梅派剧目' },
    venue: '梅兰芳大剧院、南山文体中心聚橙剧院、石家庄大剧院',
    year: '2025-2026',
    performanceCredits: [
      '主演：李胜素 饰 穆桂英（梅派青衣）',
      '主演：于魁智 饰 寇准（杨派老生）',
      '演出单位：国家京剧院一团',
      '导演：传统梅派传承',
      '巡演时间：2025-2026年全国巡演',
      '经典版本：梅兰芳1959年创排首演',
    ],
    characters: [
      { name: '穆桂英', roleType: '青衣', costumeRef: '梅派女蟒，大红缎面绣凤，参考梅兰芳1959年创排原版及李胜素传承版', historicalBasis: '宋代女将装束，戏曲女蟒规制，源于清代宫廷戏衣' },
      { name: '佘太君', roleType: '老旦', costumeRef: '老旦蟒或帔，墨绿或深紫，参考国家京剧院传统扮相', historicalBasis: '宋代诰命夫人服饰，戏曲老旦传统规制' },
      { name: '寇准', roleType: '老生', costumeRef: '老生蟒袍或官衣，参考杨派老生传统扮相', historicalBasis: '宋代文官服饰，戏曲老生官衣规制' },
    ],
    historicalBasis: '北宋杨家将故事。穆桂英为虚构人物，原型融合了杨门女将传说。梅兰芳1959年根据豫剧同名剧目移植创排为京剧。服饰参考宋代戎装及清代宫廷戏衣规制。',
    referenceImagePrompt: 'Peking Opera "Mu Guiying Takes Command" stage, National Peking Opera Theatre Company, 2025 tour, traditional shoujiu curtain backdrop, red pillar proscenium, one table two chairs center stage, golden and red imperial lighting, Li Shengsu Mei school performance style',
    fixedStructure: [
      '梅兰芳大剧院标准镜框台口',
      '传统京剧底幕（守旧）',
      '出将入相上下场门帘',
      '固定灯位系统（面光、耳光、顶光）',
      '基础舞台地胶/台毯',
    ],
    variableElements: {
      lighting: [
        '捧印场景：聚焦穆桂英的追光（内心挣扎）+周围暗光',
        '校场发兵：全场暖红亮光大场面',
        '居家赋闲：柔和暖黄散光（温馨克制）',
        '挂帅誓师：金红强光+逆光（英武豪迈）',
        '李胜素/朱虹版本：灯光注重面部刻画，面光充足',
      ],
      projection: [
        '校场背景：旌旗猎猎图案投影（简洁大气）',
        '天波府：府邸厅堂线条（暖调）',
        '战场：远山+旌旗（写意，不写实）',
      ],
      props: [
        '帅印桌（一桌二椅+帅印道具）',
        '令旗、马鞭',
        '简易点将台（桌椅组合+帐幔）',
        '杨家将旌旗（竖旗杆，可立于台口侧幕旁）',
      ],
      colorPalette: ['大红+金黄（挂帅/出征）', '暖黄（居家）', '深红（捧印/内心戏）'],
    },
    designSuggestions: [
      '【固定结构】保持京剧传统"守旧"和一桌二椅的固定布局，这是梅派经典的仪式感来源',
      '【核心可变：帅印场景】"捧印"是梅派经典。仅通过追光聚焦穆桂英，背景暗化处理，无需任何景片',
      '【校场可变】点将台用一桌二椅+帅字旗即可，帅字旗悬挂于固定吊点或立于侧幕条旁',
      '【灯光为主】国家京剧院版本的舞美以灯光为最大变量：从居家暖黄到捧印聚光，再到发兵金红',
      '【符合实际】绝不改变镜框台口和底幕结构！京剧观众期待看到传统守旧，这是审美惯例',
    ],
  },
  {
    id: 'jingju-bawangbieji',
    names: ['霸王别姬', '虞姬', '垓下歌', '十面埋伏'],
    genre: 'jingju',
    creators: { stage: '梅派经典舞台', performer: '史依弘/梅兰芳版本' },
    venue: '上海东方艺术中心、宛平剧院、金湾艺术中心',
    year: '2024-2026（史依弘"依依向梅"系列）',
    performanceCredits: [
      '主演：史依弘 饰 虞姬（梅派青衣）',
      '主演：蓝天/杨赤 饰 项羽（花脸）',
      '演出单位：上海京剧院/国家京剧院',
      '导演：梅派经典传承',
      '史依弘"依依向梅"系列演出：2024-2026年全国巡演',
      '经典版本：梅兰芳1922年首演创排',
    ],
    characters: [
      { name: '虞姬', roleType: '青衣', costumeRef: '梅派鱼鳞甲或帔，黄色缎面绣鱼鳞纹，参考梅兰芳1922年原版及史依弘复刻版', historicalBasis: '秦末楚汉时期虞姬服饰，戏曲鱼鳞甲规制，源于清宫戏衣' },
      { name: '项羽', roleType: '花脸', costumeRef: '霸王靠，黑金为主，加霸王盔，参考杨赤/蓝天版', historicalBasis: '秦末武将装束，戏曲霸王靠规制，源于清宫戏衣' },
    ],
    historicalBasis: '秦末楚汉相争时期（公元前202年），垓下之战。梅兰芳1922年根据《史记·项羽本纪》及昆曲《千金记》创排。虞姬服饰"鱼鳞甲"为梅兰芳首创。服饰参考秦末戎装及清宫戏衣档案。',
    referenceImagePrompt: 'Peking Opera "Farewell My Concubine" stage, Shi Yihong YiYiXiangMei series 2024-2026, traditional shoujiu curtain, one table two chairs center stage with military tent drape, blue and purple tragic lighting, Mei school classic staging, Shanghai Oriental Art Center performance',
    fixedStructure: [
      '标准镜框式京剧舞台',
      '底幕（守旧）',
      '基础一桌二椅（垓下帐中设宴用）',
      '固定顶光和面光',
    ],
    variableElements: {
      lighting: [
        '"看大王在帐中"：柔和暖黄帐中光（帐内）+帐外暗光',
        '四面楚歌：冷蓝侧光+闪烁效果（不安氛围）',
        '虞姬舞剑：追光紧随+地面局部亮圈（其余暗化）',
        '霸王饮酒：红光+阴影（悲壮）',
        '自刎场景：顶光直射+骤然暗场（震撼收束）',
      ],
      projection: [
        '垓下军营：军帐纹理投影（帐幕质感）',
        '楚歌四起：淡墨山水+隐约兵戈剪影（写意）',
        '战场氛围：暗红烟尘效果（烟机+低亮度投影）',
      ],
      props: [
        '虞姬双剑（核心道具，舞剑段落）',
        '酒壶酒杯（帐中设宴）',
        '简易军帐幔（帐中场景，可拆卸布幔）',
        '乌骓马鞭（象征）',
      ],
      colorPalette: ['暗红+黑（悲壮主调）', '暖黄（帐中温情）', '冷蓝（楚歌/不安）', '银白（剑舞/寒光）'],
    },
    designSuggestions: [
      '【固定结构】梅派经典严格保留传统京剧舞台格局：一桌二椅居中，守旧底幕，侧幕条',
      '【核心场景：帐中】仅用可拆卸的军帐幔围绕一桌二椅，营造"垓下帐中"空间感',
      '【灯光是绝对主角】虞姬舞剑时，全场暗灯只剩追光——这是梅派最经典的处理，无需任何景片',
      '【氛围营造】四面楚歌段落使用冷蓝侧光+烟雾机（少量），仅在底幕投影隐约的兵戈剪影',
      '【符合实际】史依弘版本证明：梅派经典不需要复杂机械装置，一桌二椅+灯光+演员表演即足够',
    ],
  },
  {
    id: 'kunqu-youyuanjingmeng',
    names: ['游园惊梦', '牡丹亭', '杜丽娘', '柳梦梅'],
    genre: 'kunqu',
    creators: { stage: '北方昆曲剧院/史依弘版', lighting: '任冬生（北昆版）', costume: '张锐（故宫纹样复刻）' },
    venue: '国家大剧院戏剧厅、正乙祠戏楼、上海东方艺术中心',
    year: '2024-2026',
    performanceCredits: [
      '主演：史依弘 饰 杜丽娘（北昆版/梅派融合）',
      '主演：张军/邵峥 饰 柳梦梅（北昆小生）',
      '演出单位：北方昆曲剧院/上海京剧院（史依弘版）',
      '舞美设计：任冬生（北昆版"以光影编织梦境"）',
      '服装设计：张锐（依据故宫博物院藏明清服饰纹样复刻）',
      '正乙祠古戏楼版：2024-2025年驻场演出',
    ],
    characters: [
      { name: '杜丽娘', roleType: '闺门旦', costumeRef: '昆曲闺门旦帔或褶子，淡粉或月白，配点翠头面，参考张锐依据故宫纹样设计', historicalBasis: '明代万历年间（汤显祖《牡丹亭》1598年成书）闺秀服饰，竖领斜襟袄裙，依据故宫博物院藏明代服饰实物' },
      { name: '柳梦梅', roleType: '小生', costumeRef: '昆曲小生褶子，淡蓝或白色，参考北昆传统小生扮相', historicalBasis: '明代书生服饰，直身或道袍，配巾帽，依据《明史·舆服志》及故宫藏品' },
      { name: '花神', roleType: '旦角群像', costumeRef: '北昆版"堆花"花神服饰，各色云肩配长裙，参考北昆任冬生版设计', historicalBasis: '明代神仙/花神意象服饰，融合道教元素及民间年画中的花神形象' },
    ],
    historicalBasis: '明代万历二十六年（1598年）汤显祖著《牡丹亭还魂记》。服饰依据故宫博物院藏明代服饰实物及《明史·舆服志》记载。北昆版服装由张锐依据故宫藏明清服饰纹样重新设计复刻。',
    referenceImagePrompt: 'Kunqu Opera "The Peony Pavilion: The Dream" stage, Northern Kunqu Opera Theatre version 2024-2026, Ren Dongsheng lighting design, moon gate screens with wheels, layered gauze curtains, ink wash garden projection, pink and blue dream lighting, ancient Zhengyici theatre or National Centre for the Performing Arts, elegant literati aesthetic',
    fixedStructure: [
      '正乙祠古戏楼：雕梁画栋（固定建筑）',
      '国家大剧院版：镜框舞台+基础地台',
      '基础侧幕',
    ],
    variableElements: {
      lighting: [
        '北昆版任冬生设计："以光影编织梦境"，灯光每次变化都是情感递进',
        '游园：柔和粉绿春光（暖色调）',
        '惊梦：蓝紫梦幻光（梦境感）',
        '花神出场：渐亮暖光+局部彩色光（堆花场面）',
        '离魂：冷白顶光+长阴影（凄美）',
      ],
      projection: [
        '北昆版：三面可移动"月亮门"景片+七层纱幕（极简园林线条）',
        '水墨园林投影（山石、柳枝、花卉）',
        '梦境效果：纱幕+低亮度投影制造朦胧感',
      ],
      props: [
        '柳枝（柳梦梅手持，象征）',
        '折扇/团扇',
        '月亮门景片（北昆版，带轮可移动）',
        '多层纱幕（悬挂于固定吊点）',
        '花神"宝石花"法器（北昆版非遗工艺）',
      ],
      colorPalette: ['粉绿（游园春色）', '蓝紫（梦境）', '暖金（花神堆花）', '月白（杜丽娘服饰）'],
    },
    designSuggestions: [
      '【固定结构】古戏楼版依靠建筑本身雕梁画栋，无需添加景片；现代剧场版保留基础台口',
      '【核心可变：月亮门】北昆版使用三面带轮的"月亮门"景片，可在舞台上推移组合出不同园林角落',
      '【纱幕层次】在固定吊点悬挂2-3层纱幕，通过前后投影制造景深（人在景中、景随人移）',
      '【灯光即画笔】任冬生设计的关键：不用实体花木，而用灯光在纱幕/地面投射花影',
      '【符合实际】史依弘演出版恢复梅兰芳早期版本，以大堆花场面（群像上场）为主，只需开阔舞台+灯光即可',
    ],
  },
  {
    id: 'qinqiang-zhameian',
    names: ['铡美案', '秦香莲', '包公', '陈世美'],
    genre: 'qinqiang',
    creators: { stage: '陕西省戏曲研究院传统舞美', lighting: '传统秦腔灯位' },
    venue: '宁夏人民剧院、陕西戏曲研究院剧场',
    year: '传统经典/2026年巡演',
    performanceCredits: [
      '主演：包公（花脸）、秦香莲（正旦）',
      '演出单位：陕西戏曲研究院四团',
      '巡演时间：2026年宁夏人民剧院等',
      '传统秦腔经典，源自《包公案》故事',
      '经典版本：贠宗翰、李爱琴等前辈艺术家版本',
    ],
    characters: [
      { name: '包拯', roleType: '花脸', costumeRef: '秦腔花脸黑蟒，月牙脸谱，参考陕西戏曲研究院传统扮相', historicalBasis: '宋代官员服饰，戏曲花脸传统规制，黑面月牙象征公正' },
      { name: '秦香莲', roleType: '正旦', costumeRef: '秦腔正旦青衣，素色帔，参考秦腔传统青衣扮相', historicalBasis: '宋代平民女子服饰，戏曲青衣规制，素色表示清贫' },
      { name: '陈世美', roleType: '老生', costumeRef: '秦腔老生蟒袍或官衣，黑色为主，参考秦腔传统老生扮相', historicalBasis: '宋代驸马服饰，戏曲老生官衣规制' },
    ],
    historicalBasis: '北宋时期包公断案故事。陈世美为虚构人物，原型说法不一。服饰参考宋代服饰及秦腔传统戏服规制。',
    referenceImagePrompt: 'Qinqiang Opera "The Case of Chen Shimei" stage, Shaanxi Provincial Traditional Opera Research Institute, grand courtroom set with dragon pillars, black and red judge robes, dramatic Qinqiang theatrical lighting, official ceremony atmosphere',
    fixedStructure: [
      '秦腔传统舞台台口',
      '底幕（守旧）',
      '公堂案桌（一桌二椅加公案布）',
      '固定灯位系统',
    ],
    variableElements: {
      lighting: [
        '公堂审案：高亮度白光+红色侧光（威严）',
        '秦香莲诉苦：柔和暖黄面光（同情）',
        '铡美高潮：全场红色饱和光+追光聚焦',
        '王朝马汉出场：蓝色逆光剪影',
      ],
      projection: [
        '公堂背景：龙纹图案投影（简洁大气）',
        '寒窑场景：茅屋剪影投影（极简）',
        '结局：青天白日投影（象征公正）',
      ],
      props: [
        '虎头铡（核心道具，铡美高潮）',
        '令签、惊堂木',
        '枷锁、刑具',
        '王朝马汉棍棒',
      ],
      colorPalette: ['大红（公堂/铡美）', '素白（秦香莲）', '墨黑（包拯）', '金黄（皇家）'],
    },
    designSuggestions: [
      '【固定结构保留】秦腔传统舞台，保持底幕和基本灯位',
      '【核心原则：公堂氛围】《铡美案》以公堂审案为主，需要营造威严气氛',
      '【虎头铡是关键】虎头铡道具必须突出，可使用可开合的道具铡',
      '【灯光分色】用红色表现威严，素白表现秦香莲的悲惨',
      '【符合实际】公堂案桌用一桌二椅+公案布覆盖即可，保证演员表演空间',
    ],
  },
  {
    id: 'piying-xiyouji',
    names: ['皮影西游记', '三打白骨精', '皮影戏', '西游记'],
    genre: 'piying',
    creators: { stage: '陕西华县皮影戏传承中心', lighting: '传统皮影灯光' },
    venue: '西安皮影博物馆、各地非遗展演',
    year: '传统非遗/2026年巡演',
    performanceCredits: [
      '主演：皮影艺人操作',
      '演出单位：陕西华县皮影戏传承中心',
      '非遗级别：国家级非物质文化遗产',
      '经典剧目：三打白骨精、大闹天宫等',
      '巡演：2026年各地非遗展演',
    ],
    characters: [
      { name: '孙悟空', roleType: '皮影', costumeRef: '皮影孙悟空造型，红黄为主，金箍棒道具，参考陕西华县传统皮影', historicalBasis: '明代《西游记》孙悟空形象，皮影传统雕刻工艺' },
      { name: '唐僧', roleType: '皮影', costumeRef: '皮影唐僧造型，袈裟披身，禅杖道具，参考陕西华县传统皮影', historicalBasis: '唐代僧人服饰，皮影传统雕刻工艺' },
      { name: '白骨精', roleType: '皮影', costumeRef: '皮影白骨精造型，妖媚风格，可变换造型，参考陕西华县传统皮影', historicalBasis: '《西游记》白骨精形象，皮影传统雕刻工艺' },
    ],
    historicalBasis: '明代吴承恩《西游记》。皮影戏起源于西汉，成熟于唐宋，陕西华县皮影戏为国家级非遗。皮影造型依据传统雕刻工艺，色彩鲜艳，线条流畅。',
    referenceImagePrompt: 'Chinese shadow puppet theater "Journey to the West" stage, Shaanxi Huaxian traditional shadow play, translucent leather puppets behind white screen, warm lamp light projection, monkey king and monsters silhouettes, traditional Chinese folk art performance',
    fixedStructure: [
      '一块白色纱幕（皮影戏唯一舞台背景）',
      '灯光投射装置（纱幕后方）',
      '操作区域（纱幕后方，艺人站立位置）',
    ],
    variableElements: {
      lighting: [
        '基本照明：纱幕后暖白光（皮影基本亮度）',
        '场景切换：灯光明暗变化（日出/日落/夜景）',
      ],
      projection: [
        '简单背景：纱幕上投射淡色山水剪影',
      ],
      props: [
        '皮影人物（透光皮革雕刻）',
        '皮影道具（桌椅、兵器、车辆等）',
        '皮影布景片（树木、山石、建筑等）',
      ],
      colorPalette: ['暖黄（灯光）', '本色（皮影雕刻颜色）'],
    },
    designSuggestions: [
      '【固定结构】只有一块白色纱幕，人在幕后操作',
      '【核心原则：简洁】皮影戏不需要复杂背景，幕布即是舞台',
      '【道具】皮影人物和道具都是透光的皮革雕刻',
      '【灯光】只有纱幕后的一盏灯，不需要复杂灯位',
      '【符合实际】皮影戏舞台极简：一块幕布+一盏灯+皮影',
    ],
  },
];

// 匹配剧本名的函数，只返回匹配当前剧本的参考，不补充其他剧种
export function findPlayReference(playName) {
  if (!playName || !playName.trim()) return [];
  const normalized = playName.trim().toLowerCase();
  const matches = [];

  for (const ref of playStageReferences) {
    for (const name of ref.names) {
      if (normalized.includes(name.toLowerCase())) {
        matches.push(ref);
        break;
      }
    }
  }

  return matches;
}

// 根据剧种获取通用固定结构提示
export function getGenericFixedStructure(genre) {
  const genreSpecificFixed = {
    jingju: ['底幕（守旧）绣有"福禄寿"图案', '出将入相门帘', '红漆柱式台框', '固定一桌二椅'],
    kunqu: ['古戏楼式台口或镜框', '淡雅底幕', '基础面光侧光'],
    yueju: ['镜框式现代舞台台口', '基础LED大屏框架', '固定面光系统'],
    qinqiang: ['传统底幕', '开阔平整舞台地面（为武戏预留）', '基础顶光和面光'],
    piying: ['皮影幕布框架（固定）', '灯光投射装置（固定位置）', '皮影操作区域（固定）'],
  };
  return genreSpecificFixed[genre] || fixedStageStructures.traditional;
}
