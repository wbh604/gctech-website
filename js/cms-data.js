/**
 * CMS Data Access Layer
 * Shared by frontend website and admin panel.
 * Uses localStorage with 'cms_' prefix for persistence.
 */
(function () {
    'use strict';

    // 客户数据版本号（变更时自动重置localStorage为最新默认值）
    var DATA_VERSION = 'gctech-2026-04-25-v2';
    if (typeof localStorage !== 'undefined') {
        var savedVer = localStorage.getItem('cms_data_version');
        if (savedVer !== DATA_VERSION) {
            ['cms_products','cms_apps','cms_news','cms_banners','cms_product_cats','cms_settings'].forEach(function(k){
                localStorage.removeItem(k);
            });
            localStorage.setItem('cms_data_version', DATA_VERSION);
        }
    }

    var STORAGE_KEYS = {
        products:     'cms_products',
        apps:         'cms_apps',
        news:         'cms_news',
        banners:      'cms_banners',
        product_cats: 'cms_product_cats',
        settings:     'cms_settings',
        messages:     'cms_messages'
    };

    // ==================== DEFAULT DATA ====================

    var DEFAULT_PRODUCTS = {
    "prod_1000": {
        "name": "飞秒激光微纳加工设备",
        "cat": "femto",
        "img": "images/535d41237840-535d-4123-7840-535d4123.png",
        "desc": "搭载高质量飞秒激光器，配合自主研发的高精密多轴运动平台，实现材料的可控锥度高精密加工",
        "specs": [
            [
                "飞秒激光器（1030/515nm）",
                ""
            ],
            [
                "配置五轴运动平台（X, Y, Z, A ,C）",
                ""
            ],
            [
                "行程（X/Y/Z）:150mm*150mm*60mm",
                ""
            ],
            [
                "A 轴行程：-10-10°",
                ""
            ],
            [
                "C 轴行程：±360°",
                ""
            ],
            [
                "重复定位精度：±1-2μm",
                ""
            ],
            [
                "载物台尺寸：100×100mm",
                ""
            ],
            [
                "加工锥度：0~5°",
                ""
            ],
            [
                "加工精度：±1μm",
                ""
            ],
            [
                "热影响区：≤1μm",
                ""
            ]
        ],
        "highlights": [
            "高品质可定制飞秒激光",
            "多轴联动精密加工"
        ]
    },
    "prod_1001": {
        "name": "原位微拉伸力学性能测试装备",
        "cat": "sem-mech",
        "img": "images/f2828af8c625-f282-8af8-c625-f2828af8.jpg",
        "desc": "集成了力学拉伸压缩测试模块，轻量化设计，重量仅1.7kg，可与市面上大部分扫描电镜配合，自主研发的离轴设计及样品倾转70°特殊结构设计，无需设备倾转即可EBSD配合进行原位EBSD拉伸测试",
        "specs": [
            [
                "兼容指定型号扫描电镜、兼容EBSD功能",
                ""
            ],
            [
                "功能模式：拉伸、挤压、循环加载",
                ""
            ],
            [
                "外形尺寸：150*92*54（mm）",
                ""
            ],
            [
                "最大拉力：2000 N",
                ""
            ],
            [
                "拉伸台重量：≤1.8 kg",
                ""
            ],
            [
                "力传感器精度：",
                ""
            ],
            [
                "力传感器分辨率：0.0032 um",
                ""
            ]
        ],
        "highlights": []
    },
    "prod_1002": {
        "name": "水浸式超声波检测设备",
        "cat": "ultrasonic",
        "img": "images/9b420058286c-9b42-0058-286c-9b420058.jpg",
        "desc": "采用超窄脉冲信号发射及高速信号采集的超声板卡，配合四轴运动平台，实现异性工件的超声波自动化检测",
        "specs": [
            [
                "1、集超窄脉冲信号发射、A/D转换为一体的多通道超声板卡，具备高达 10KHz 的脉冲重复频率(PRE)，能够应对高速自动化检测任务。",
                ""
            ],
            [
                "2、脉冲参数",
                ""
            ],
            [
                "脉冲电压：100V/200V/400V",
                ""
            ],
            [
                "脉冲方式：负方波",
                ""
            ],
            [
                "脉冲宽度：25ns-1000ns/步进2.5ns",
                ""
            ],
            [
                "脉冲上升时间：＜8ns",
                ""
            ],
            [
                "3、数据采集",
                ""
            ],
            [
                "采样率：100Mhz",
                ""
            ],
            [
                "分辨率：12bit",
                ""
            ],
            [
                "最大A扫长度：16384",
                ""
            ],
            [
                "4、扫描与显示",
                ""
            ],
            [
                "显示模式：A/B/C/D",
                ""
            ],
            [
                "5、有效行程：X轴:1051mm，Y轴:600mm，Z轴:450mm，T轴：±360°； ",
                ""
            ],
            [
                "6、X/Y/Z轴重复定位精度：0.01mm。",
                ""
            ],
            [
                "7、提供水循环系统",
                ""
            ]
        ],
        "highlights": []
    }
};

    var DEFAULT_APPS = {
    "app_1000": {
        "name": "原位微拉伸力学性能测试装备",
        "desc": "EBSD原位拉伸测试",
        "img": "images/831686d99c28-8316-86d9-9c28-831686d9.png",
        "articles": []
    },
    "app_1001": {
        "name": "发动机连杆衬套贴合度超声波检测",
        "desc": "采用水浸式超声波检测的方法对发动机连杆衬套配合面的缺陷进行检测",
        "img": "images/0dc6ddda4bec-0dc6-ddda-4bec-0dc6ddda.png",
        "articles": []
    }
};

    var DEFAULT_NEWS = {};

    var DEFAULT_BANNERS = [
    {
        "title": "飞秒激光微纳加工设备",
        "subtitle": "光辰科技仪器 GCTech",
        "desc": "搭载高质量飞秒激光器，配合自主研发的高精密多轴运动平台，实现材料的可控锥度高精密加工",
        "bgImage": "images/ceb403818487-ceb4-0381-8487-ceb40381.png",
        "btnText": "了解更多 +",
        "btnLink": "products"
    },
    {
        "title": "原位微拉伸力学性能测试装备",
        "subtitle": "光辰科技仪器 GCTech",
        "desc": "集成力学拉伸压缩测试模块，自主研发离轴设计与样品倾转70°结构，可直接与EBSD配合进行原位测试",
        "bgImage": "images/f2828af8c625-f282-8af8-c625-f2828af8.jpg",
        "btnText": "了解更多 +",
        "btnLink": "products"
    },
    {
        "title": "水浸式超声波检测设备",
        "subtitle": "光辰科技仪器 GCTech",
        "desc": "采用超窄脉冲信号发射及高速信号采集，实现异性工件的超声波自动化检测",
        "bgImage": "images/9b420058286c-9b42-0058-286c-9b420058.jpg",
        "btnText": "了解更多 +",
        "btnLink": "products"
    }
];

    var DEFAULT_PRODUCT_CATS = [
    {
        "key": "femto",
        "name": "飞秒激光微纳加工"
    },
    {
        "key": "sem-mech",
        "name": "原位力学测试"
    },
    {
        "key": "ultrasonic",
        "name": "超声波检测"
    }
];

    var DEFAULT_SETTINGS = {
    "phone": "",
    "mobile": "18688787186",
    "email": "17688292259@163.com",
    "email2": "",
    "address": "深圳市宝安区西乡街道共乐社区共和工业路107号华丰互联网创意园A座641",
    "qrcode": "",
    "footerQrcode": "",
    "offices": [],
    "logoLight": "images/883cf5d20bcb-883c-f5d2-0bcb-883cf5d2.png",
    "logoDark": "images/883cf5d20bcb-883c-f5d2-0bcb-883cf5d2.png",
    "aboutVideo": "",
    "aboutVideoThumb": "",
    "aboutIntro": "深圳光辰科技仪器有限公司成立于2025年08月26日，公司专注于激光加工、微纳加工、原位测量系统、超声波检测等精密设备的研究，致力于为智能制造、半导体、生物医疗及航空航天等领域提供高精度、高稳定性的核心装备与系统解决方案。",
    "missionTitle": "使命",
    "missionDesc": "精密设备赋能科技创新",
    "visionTitle": "愿景",
    "visionDesc": "成为精密仪器领域客户值得信赖的科技创新合作伙伴",
    "valuesTitle": "核心价值观",
    "valuesDesc": "光启精微，辰至匠心",
    "timeline": [],
    "certs": [],
    "siteTitle": "光辰科技仪器-深圳光辰科技仪器有限公司",
    "siteDesc": "深圳光辰科技仪器有限公司成立于2025年08月26日，公司专注于激光加工、微纳加工、原位测量系统、超声波检测等精密设备的研究，致力于为智能制造、半导体、生物医疗及航空航天等领域提供高精度、高稳定性的核心装备与系统解决方案。",
    "siteKeywords": "飞秒激光,微纳加工,原位拉伸,超声波检测,精密仪器,光辰科技",
    "icp": "",
    "logo": "",
    "announcementEnabled": false,
    "announcementText": "",
    "announcementLink": "",
    "announcementBg": "#e60013",
    "socialWechat": "",
    "socialWeibo": "",
    "socialDouyin": "",
    "adminUser": "admin",
    "adminPass": "GCTech@2026",
    "emailjs": {
        "serviceId": "",
        "templateId": "",
        "publicKey": ""
    },
    "customAssets": []
};

    var DEFAULT_MESSAGES = [];

    // ==================== HELPER FUNCTIONS ====================

    function getStore(key, defaults) {
        try {
            var raw = localStorage.getItem(key);
            if (raw !== null) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn('CMS: Failed to read ' + key, e);
        }
        return defaults;
    }

    function setStore(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('CMS: Failed to write ' + key, e);
        }
    }

    // ==================== PUBLIC API ====================

    window.CMS = {
        // --- Products ---
        getProducts: function () {
            return getStore(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
        },
        saveProducts: function (data) {
            setStore(STORAGE_KEYS.products, data);
        },

        // --- Apps ---
        getApps: function () {
            return getStore(STORAGE_KEYS.apps, DEFAULT_APPS);
        },
        saveApps: function (data) {
            setStore(STORAGE_KEYS.apps, data);
        },

        // --- News ---
        getNews: function () {
            return getStore(STORAGE_KEYS.news, DEFAULT_NEWS);
        },
        saveNews: function (data) {
            setStore(STORAGE_KEYS.news, data);
        },

        // --- Banners ---
        getBanners: function () {
            return getStore(STORAGE_KEYS.banners, DEFAULT_BANNERS);
        },
        saveBanners: function (data) {
            setStore(STORAGE_KEYS.banners, data);
        },

        // --- Settings ---
        getSettings: function () {
            return getStore(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
        },
        saveSettings: function (data) {
            setStore(STORAGE_KEYS.settings, data);
        },

        // --- Product Categories ---
        getProductCats: function () {
            return getStore(STORAGE_KEYS.product_cats, DEFAULT_PRODUCT_CATS);
        },
        saveProductCats: function (data) {
            setStore(STORAGE_KEYS.product_cats, data);
        },

        // --- Messages ---
        getMessages: function () {
            return getStore(STORAGE_KEYS.messages, DEFAULT_MESSAGES);
        },
        saveMessages: function (data) {
            setStore(STORAGE_KEYS.messages, data);
        },

        // --- Export All ---
        exportAll: function () {
            var allData = {};
            var self = this;
            var getters = {
                products: self.getProducts,
                apps: self.getApps,
                news: self.getNews,
                banners: self.getBanners,
                product_cats: self.getProductCats,
                settings: self.getSettings,
                messages: self.getMessages
            };
            Object.keys(getters).forEach(function (k) {
                allData[k] = getters[k]();
            });
            return JSON.stringify(allData, null, 2);
        },

        // --- Import All ---
        importAll: function (json) {
            try {
                var allData = typeof json === 'string' ? JSON.parse(json) : json;
                if (allData.products !== undefined) this.saveProducts(allData.products);
                if (allData.apps !== undefined) this.saveApps(allData.apps);
                if (allData.news !== undefined) this.saveNews(allData.news);
                if (allData.banners !== undefined) this.saveBanners(allData.banners);
                if (allData.product_cats !== undefined) this.saveProductCats(allData.product_cats);
                if (allData.settings !== undefined) this.saveSettings(allData.settings);
                if (allData.messages !== undefined) this.saveMessages(allData.messages);
                return true;
            } catch (e) {
                console.error('CMS: Import failed', e);
                return false;
            }
        },

        // --- Reset All ---
        resetAll: function () {
            Object.keys(STORAGE_KEYS).forEach(function (k) {
                localStorage.removeItem(STORAGE_KEYS[k]);
            });
        }
    };
})();
