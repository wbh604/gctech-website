// ========== 简易访客统计 ==========
(function trackVisitor() {
    // 总PV
    var pv = parseInt(localStorage.getItem('cms_stats_pv') || '0') + 1;
    localStorage.setItem('cms_stats_pv', pv.toString());

    // 今日PV
    var todayKey = new Date().toISOString().slice(0, 10);
    var todayData = localStorage.getItem('cms_stats_today_date');
    var todayPv = parseInt(localStorage.getItem('cms_stats_today') || '0');
    if (todayData !== todayKey) {
        localStorage.setItem('cms_stats_today_date', todayKey);
        todayPv = 0;
    }
    todayPv++;
    localStorage.setItem('cms_stats_today', todayPv.toString());

    // UV (根据日期去重)
    var uvDates = [];
    try { uvDates = JSON.parse(localStorage.getItem('cms_stats_uv_dates') || '[]'); } catch(e) {}
    if (uvDates.indexOf(todayKey) === -1) {
        uvDates.push(todayKey);
        localStorage.setItem('cms_stats_uv_dates', JSON.stringify(uvDates));
    }
    localStorage.setItem('cms_stats_uv', uvDates.length.toString());

    // 各页面访问次数
    var pages = {};
    try { pages = JSON.parse(localStorage.getItem('cms_stats_pages') || '{}'); } catch(e) {}
    var pageName = 'home';
    pages[pageName] = (pages[pageName] || 0) + 1;
    localStorage.setItem('cms_stats_pages', JSON.stringify(pages));
})();

function trackPageView(pageName) {
    var pages = {};
    try { pages = JSON.parse(localStorage.getItem('cms_stats_pages') || '{}'); } catch(e) {}
    pages[pageName] = (pages[pageName] || 0) + 1;
    localStorage.setItem('cms_stats_pages', JSON.stringify(pages));
}

// ========== CMS Data Accessors ==========
function getProductsData() { return (typeof CMS !== 'undefined') ? CMS.getProducts() : {}; }
function getAppsData() { return (typeof CMS !== 'undefined') ? CMS.getApps() : {}; }
function getNewsData() { return (typeof CMS !== 'undefined') ? CMS.getNews() : {}; }
function getBannersData() { return (typeof CMS !== 'undefined') ? CMS.getBanners() : []; }
function getProductCatsData() { return (typeof CMS !== 'undefined') ? CMS.getProductCats() : []; }
function getSettingsData() { return (typeof CMS !== 'undefined') ? CMS.getSettings() : {}; }

// ========== CMS Dynamic Content Injection ==========
function applyCmsSettings() {
    if (typeof CMS === 'undefined') return;
    const s = CMS.getSettings();
    // 主电话用 phone，没填则用 mobile
    const mainPhone = s.phone || s.mobile || '';
    const phoneIcon = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';

    // Update header top bar — 空字段不显示
    const topInner = document.querySelector('.header-top-inner');
    if (topInner) {
        const parts = [];
        if (s.phone) parts.push('<span>全国服务热线：' + s.phone + '</span>');
        const rightParts = [];
        if (s.mobile) rightParts.push('<span>手机：' + s.mobile + '</span>');
        if (s.email) rightParts.push('<span>邮箱：' + s.email + '</span>');
        // 如果没有 phone（左侧空），把第一个右侧字段移到左侧
        if (!s.phone && rightParts.length > 0) {
            parts.push(rightParts.shift());
        }
        topInner.innerHTML = parts.join('') + (rightParts.length ? '<div class="header-top-right">' + rightParts.join('') + '</div>' : '<div></div>');
    }
    // Update header phone — 显示主联系电话
    const headerPhone = document.querySelector('.header-phone');
    if (headerPhone) {
        if (mainPhone) {
            headerPhone.innerHTML = phoneIcon + ' ' + mainPhone;
            headerPhone.href = 'tel:' + mainPhone;
            headerPhone.style.display = '';
        } else {
            headerPhone.style.display = 'none';
        }
    }
    // Update footer contact
    const footerContact = document.querySelector('.footer-contact-col');
    if (footerContact) {
        const phoneItem = mainPhone ? `<p>${phoneIcon.replace('width="18" height="18"', 'width="14" height="14"')} ${mainPhone}</p>` : '';
        const mobileItem = (s.phone && s.mobile) ? `<p>手机：${s.mobile}</p>` : '';
        const emailItem = s.email ? `<p>邮箱：${s.email}</p>` : '';
        const addressItem = s.address ? `<p>地址：${s.address}</p>` : '';
        footerContact.innerHTML = `<h4>联系我们</h4>${phoneItem}${mobileItem}${emailItem}${addressItem}<a href="#" onclick="navigateTo('contact','message');return false" class="footer-consult-btn">在线咨询 +</a>`;
    }
    // 渲染页脚导航（动态从CMS生成）
    renderFooterNav();
    // Update footer QR code
    const footerQr = document.querySelector('.footer-qr img');
    if (footerQr && s.footerQrcode) { footerQr.src = s.footerQrcode; }
    // Update side widget QR popup
    const sideQrImg = document.querySelector('.side-qr-popup img');
    if (sideQrImg && s.footerQrcode) { sideQrImg.src = s.footerQrcode; }
    // Update footer ICP
    const footerBottom = document.querySelector('.footer-bottom');
    if (footerBottom && s.icp) {
        footerBottom.innerHTML = `<span>&copy; ${new Date().getFullYear()} 深圳光辰科技仪器有限公司 All Rights Reserved.</span><span>${s.icp}</span>`;
    }
    // Update SEO meta tags
    if (s.siteTitle) document.title = s.siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && s.siteDesc) metaDesc.content = s.siteDesc;
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw && s.siteKeywords) metaKw.content = s.siteKeywords;
    // Update side widget phone
    const sidePhone = document.querySelector('.side-widget-item[title="电话咨询"]');
    if (sidePhone) sidePhone.href = 'tel:' + s.phone;

    // Announcement bar
    const annBar = document.getElementById('announcementBar');
    if (annBar) {
        if (s.announcementEnabled && s.announcementText) {
            const annTextEl = document.getElementById('announcementText');
            if (annTextEl) {
                let annHtml = s.announcementText;
                if (s.announcementLink) {
                    const isExternal = s.announcementLink.startsWith('http');
                    if (isExternal) {
                        annHtml += ' <a href="' + s.announcementLink + '" target="_blank">了解详情</a>';
                    } else {
                        annHtml += ' <a href="#" onclick="navigateTo(\'' + s.announcementLink + '\');return false">了解详情</a>';
                    }
                }
                annTextEl.innerHTML = annHtml;
            }
            if (s.announcementBg) annBar.style.background = s.announcementBg;
            annBar.classList.add('visible');
        } else {
            annBar.classList.remove('visible');
        }
    }

    // Social media links in footer
    const footerSocial = document.getElementById('footerSocial');
    if (footerSocial) {
        let hasSocial = false;
        // Wechat
        const wechatLink = document.getElementById('socialWechatLink');
        if (wechatLink) {
            if (s.socialWechat) {
                wechatLink.style.display = 'flex';
                const qrDiv = document.getElementById('socialWechatQr');
                if (qrDiv) { qrDiv.style.display = ''; qrDiv.querySelector('img').src = s.socialWechat; }
                hasSocial = true;
            } else { wechatLink.style.display = 'none'; }
        }
        // Weibo
        const weiboLink = document.getElementById('socialWeiboLink');
        if (weiboLink) {
            if (s.socialWeibo) { weiboLink.href = s.socialWeibo; weiboLink.style.display = 'flex'; hasSocial = true; }
            else { weiboLink.style.display = 'none'; }
        }
        // Douyin
        const douyinLink = document.getElementById('socialDouyinLink');
        if (douyinLink) {
            if (s.socialDouyin) { douyinLink.href = s.socialDouyin; douyinLink.style.display = 'flex'; hasSocial = true; }
            else { douyinLink.style.display = 'none'; }
        }
        footerSocial.style.display = hasSocial ? 'flex' : 'none';
    }
}

// ========== 渲染页脚导航（从CMS动态生成）==========
function renderFooterNav() {
    const navCol = document.getElementById('footerNavCol');
    if (!navCol) return;

    const products = (typeof getProductsData === 'function') ? getProductsData() : {};
    const apps = (typeof getAppsData === 'function') ? getAppsData() : {};
    const cats = (typeof getProductCatsData === 'function') ? getProductCatsData() : [];
    const news = (typeof getNewsData === 'function') ? getNewsData() : {};

    // 产品导航：优先用分类（按分类列产品入口），否则列产品名
    let prodHtml = '';
    if (cats && cats.length) {
        prodHtml = cats.map(c => `<a href="#" onclick="navigateTo('products','${c.key}');return false">${c.name}</a>`).join('');
    } else {
        prodHtml = Object.entries(products).slice(0, 6).map(([id, p]) =>
            `<a href="#" onclick="navigateTo('product-detail','${id}');return false">${p.name}</a>`
        ).join('');
    }

    // 应用导航
    const appHtml = Object.entries(apps).map(([k, a]) =>
        `<a href="#" onclick="navigateTo('app-detail','${k}');return false">${a.name}</a>`
    ).join('');

    // 新闻区块（如果有新闻）
    const newsCount = Object.keys(news).length;
    const newsHtml = newsCount > 0
        ? `<div class="footer-nav-group"><h4>资讯中心</h4><a href="#" onclick="navigateTo('news');return false">企业动态</a></div>`
        : '';

    navCol.innerHTML = `
        <div class="footer-nav-group">
            <h4><a href="#" onclick="navigateTo('home');return false" style="color:inherit">首页</a></h4>
        </div>
        ${prodHtml ? `<div class="footer-nav-group"><h4>产品中心</h4>${prodHtml}</div>` : ''}
        ${appHtml ? `<div class="footer-nav-group"><h4>热门应用</h4>${appHtml}</div>` : ''}
        ${newsHtml}
        <div class="footer-nav-group">
            <h4>关于我们</h4>
            <a href="#" onclick="navigateTo('about');return false">企业简介</a>
        </div>
        <div class="footer-nav-group">
            <h4>联系我们</h4>
            <a href="#" onclick="navigateTo('contact');return false">联系方式</a>
            <a href="#" onclick="navigateTo('contact','message');return false">在线留言</a>
        </div>
    `;
}

// ========== 1. renderHeroBanners ==========
function renderHeroBanners() {
    const slidesContainer = document.querySelector('.hero-slides');
    const paginationContainer = document.getElementById('heroPagination');
    if (!slidesContainer || !paginationContainer) return;

    const banners = getBannersData();
    if (!banners || !banners.length) return;

    // Build slides HTML
    slidesContainer.innerHTML = banners.map((b, i) => {
        const bgStyle = b.bgImage
            ? `background-image: url(${b.bgImage});`
            : `background: linear-gradient(135deg, #001833 0%, #003366 40%, #004c99 70%, #002244 100%);`;
        const overlayStyle = !b.bgImage
            ? ` style="background: linear-gradient(135deg, rgba(0,20,60,0.4), rgba(0,80,160,0.2));"`
            : '';
        // Parse btnLink: could be "products" or "products,sem"
        const linkParts = (b.btnLink || 'products').split(',');
        const onclickStr = linkParts.length > 1
            ? `navigateTo('${linkParts[0]}','${linkParts[1]}');return false`
            : `navigateTo('${linkParts[0]}');return false`;
        return `<div class="hero-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                    <div class="hero-slide-bg" style="${bgStyle}"></div>
                    <div class="hero-slide-overlay"${overlayStyle}></div>
                    <div class="hero-content">
                        <div class="hero-subtitle anim-fade-up" style="animation-delay:0.3s">${b.subtitle || ''}</div>
                        <h1 class="hero-title anim-fade-up" style="animation-delay:0.5s">${b.title || ''}</h1>
                        <div class="hero-line anim-line-expand" style="animation-delay:0.8s"></div>
                        <p class="hero-desc anim-fade-up" style="animation-delay:0.9s">${b.desc || ''}</p>
                        <a href="#" onclick="${onclickStr}" class="hero-btn anim-fade-up" style="animation-delay:1.1s">${b.btnText || '了解更多 +'}</a>
                    </div>
                </div>`;
    }).join('');

    // Build pagination dots
    paginationContainer.innerHTML = banners.map((_, i) =>
        `<button class="hero-dot${i === 0 ? ' active' : ''}" onclick="heroGoto(${i})"></button>`
    ).join('');

    // Re-initialize hero carousel variables
    reinitHeroCarousel();
}

// ========== 2. renderHomeProducts ==========
function renderHomeProducts() {
    const grid = document.querySelector('#page-home .products-grid');
    if (!grid) return;

    // 从 CMS 真实产品数据生成首页卡片
    const products = getProductsData();
    const productEntries = Object.entries(products);
    if (!productEntries.length) { grid.innerHTML = ''; return; }

    const cats = getProductCatsData();
    const catNameMap = {};
    cats.forEach(c => { catNameMap[c.key] = c.name; });

    const homeCards = productEntries.map(([id, p]) => ({
        cat: p.cat,
        tag: catNameMap[p.cat] || p.cat || 'Product',
        title: p.name,
        titleEn: '',
        img: p.img,
        linkId: id
    }));

    // Pattern: index 0 => large, 1-4 => small, 5 => large
    const arrowSvg = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';

    grid.innerHTML = homeCards.map((card, i) => {
        // 大卡片：第0个和第5个；其他为小卡片。少于6个时第0个大、其余小
        const isLarge = (i === 0 || (homeCards.length >= 6 && i === 5));
        const sizeClass = isLarge ? 'large' : 'small';
        const delayClass = !isLarge ? ` reveal-delay-${((i - 1) % 2) + 1}` : '';
        // 点击跳转到产品详情页
        const linkAction = `navigateTo('product-detail','${card.linkId}')`;

        if (isLarge) {
            return `<div class="product-card ${sizeClass} reveal${delayClass}" onclick="${linkAction}">
                        <div class="product-card-info">
                            <span class="product-card-tag">${card.tag}</span>
                            <h3 class="product-card-title">${card.title}</h3>
                            <p class="product-card-title-en">${card.titleEn}</p>
                            <a href="#" class="product-card-link" onclick="${linkAction};return false">更多 +${arrowSvg}</a>
                        </div>
                        <div class="product-card-img">
                            <img src="${card.img}" alt="${card.title}" loading="lazy">
                        </div>
                    </div>`;
        } else {
            return `<div class="product-card ${sizeClass} reveal${delayClass}" onclick="${linkAction}">
                        <div class="product-card-img">
                            <img src="${card.img}" alt="${card.title}" loading="lazy">
                        </div>
                        <div class="product-card-info">
                            <span class="product-card-tag">${card.tag}</span>
                            <h3 class="product-card-title">${card.title}</h3>
                            <p class="product-card-title-en">${card.titleEn}</p>
                        </div>
                    </div>`;
        }
    }).join('');
}

// ========== 3. renderHomeApps ==========
function renderHomeApps() {
    const track = document.getElementById('appTrack');
    if (!track) return;

    const apps = getAppsData();
    const entries = Object.entries(apps);
    if (!entries.length) return;

    const arrowSvg = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path fill="currentColor" d="M708.267 401.067V597.333h85.333V256h-341.333v85.333h196.267L256 733.867l59.733 59.733 392.534-392.533z"/></svg>';
    const arrowBgSvg = '<svg viewBox="0 0 1024 1024" width="60" height="60"><path fill="currentColor" d="M708.267 401.067V597.333h85.333V256h-341.333v85.333h196.267L256 733.867l59.733 59.733 392.534-392.533z"/></svg>';

    track.innerHTML = entries.map(([key, app]) =>
        `<div class="app-card" onclick="navigateTo('app-detail','${key}')">
            <div class="app-card-img">
                <img src="${app.img || ''}" alt="${app.name}" loading="lazy">
            </div>
            <div class="app-card-content">
                <div class="app-card-top">
                    <h3 class="app-card-title">${app.name}</h3>
                    <div class="app-card-arrow">${arrowSvg}</div>
                </div>
                <p class="app-card-desc">${app.desc || ''}</p>
            </div>
            <div class="app-card-arrow-bg">${arrowBgSvg}</div>
        </div>`
    ).join('');

    // Reset swiper offset
    appOffset = 0;
    track.style.transform = 'translateX(0px)';
}

// ========== 4. renderHomeNews ==========
function renderHomeNews() {
    const newsGrid = document.querySelector('#page-home .news-grid');
    if (!newsGrid) return;

    const news = getNewsData();
    const entries = Object.entries(news).slice(0, 3);
    // 没新闻时隐藏整个新闻区
    const newsSection = document.querySelector('#page-home .news-section');
    if (!entries.length) {
        if (newsSection) newsSection.style.display = 'none';
        newsGrid.innerHTML = '';
        return;
    }
    if (newsSection) newsSection.style.display = '';

    newsGrid.innerHTML = entries.map(([key, n], i) =>
        `<div class="news-card reveal reveal-delay-${i + 1}" onclick="navigateTo('news-detail','${key}')">
            <div class="news-card-img"><img src="${n.img || ''}" alt="${n.title}" loading="lazy"></div>
            <div class="news-card-info">
                <h3 class="news-card-title">${n.title}</h3>
                <p class="news-card-excerpt">${n.excerpt || ''}</p>
                <span class="news-card-date">${n.date}</span>
            </div>
        </div>`
    ).join('');
}

// ========== 5. renderProductsPage ==========
var _prodCurrentPage = 1;
var _prodCurrentCat = 'all';
var _prodPerPage = 9;

function renderProductsPage(page, cat) {
    if (page !== undefined) _prodCurrentPage = page;
    if (cat !== undefined) _prodCurrentCat = cat;

    const cats = getProductCatsData();
    const sidebarList = document.querySelector('#page-products .sidebar-cat-list');
    if (sidebarList) {
        // Note: CMS data is trusted (admin-controlled), safe for innerHTML
        sidebarList.innerHTML = '<li class="sidebar-cat' + (_prodCurrentCat === 'all' ? ' active' : '') + '" onclick="filterProducts(\'all\',this)">全部产品</li>' +
            cats.map(c => '<li class="sidebar-cat' + (_prodCurrentCat === c.key ? ' active' : '') + '" onclick="filterProducts(\'' + c.key + '\',this)">' + c.name + '</li>').join('');
    }

    const products = getProductsData();
    let entries = Object.entries(products);
    if (_prodCurrentCat !== 'all') entries = entries.filter(([_, p]) => p.cat === _prodCurrentCat);

    const totalItems = entries.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / _prodPerPage));
    if (_prodCurrentPage > totalPages) _prodCurrentPage = totalPages;
    const start = (_prodCurrentPage - 1) * _prodPerPage;
    const pageEntries = entries.slice(start, start + _prodPerPage);

    const productList = document.getElementById('productList');
    if (productList) {
        if (pageEntries.length === 0) {
            productList.innerHTML = '<div style="text-align:center;padding:60px 0;color:#98a2b3">暂无产品</div>';
        } else {
            productList.innerHTML = pageEntries.map(([id, p]) =>
                '<div class="product-list-item" data-cat="' + p.cat + '" onclick="navigateTo(\'product-detail\',\'' + id + '\')">' +
                '<div class="product-list-img"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></div>' +
                '<div class="product-list-info"><h3>' + p.name + '</h3><div class="product-list-divider"></div><p>' + (p.desc ? p.desc.substring(0, 50) : p.name) + '</p></div></div>'
            ).join('');
        }
    }

    const paginationEl = document.getElementById('productPagination');
    if (paginationEl) {
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
        } else {
            let html = '';
            if (_prodCurrentPage > 1) html += '<span class="page-num" onclick="renderProductsPage(' + (_prodCurrentPage - 1) + ')">&lt;</span>';
            for (let i = 1; i <= totalPages; i++) {
                html += '<span class="page-num' + (i === _prodCurrentPage ? ' active' : '') + '" onclick="renderProductsPage(' + i + ')">' + i + '</span>';
            }
            if (_prodCurrentPage < totalPages) html += '<span class="page-num" onclick="renderProductsPage(' + (_prodCurrentPage + 1) + ')">&gt;</span>';
            paginationEl.innerHTML = html;
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 6. renderAppsPage ==========
function renderAppsPage() {
    const grid = document.querySelector('#page-applications .app-page-grid');
    if (!grid) return;

    const apps = getAppsData();
    const entries = Object.entries(apps);
    if (!entries.length) return;

    grid.innerHTML = entries.map(([key, app], i) =>
        `<div class="app-page-card reveal${i > 0 ? ' reveal-delay-' + ((i % 3) || 3) : ''}" onclick="navigateTo('app-detail','${key}')">
            <div class="app-page-card-img"><img src="${app.img || ''}" alt="${app.name}" loading="lazy"></div>
            <div class="app-page-card-body">
                <h3>${app.name}</h3>
                <div class="app-page-card-divider"></div>
                <p>${app.desc || ''}</p>
            </div>
        </div>`
    ).join('');
}

// ========== 7. renderNewsPage ==========
function renderNewsPage() {
    const list = document.querySelector('#page-news .news-full-list');
    if (!list) return;

    const news = getNewsData();
    const entries = Object.entries(news);
    if (!entries.length) return;

    list.innerHTML = entries.map(([key, n], i) => {
        const dateParts = (n.date || '').split('-');
        const day = dateParts[2] || '';
        const ym = dateParts.length >= 2 ? dateParts[0] + '-' + dateParts[1] : '';
        const delayClass = i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : '';
        return `<div class="news-full-item reveal${delayClass}" onclick="navigateTo('news-detail','${key}')">
                    <div class="news-full-date"><span class="day">${day}</span><span class="ym">${ym}</span></div>
                    <div class="news-full-img"><img src="${n.img || ''}" alt="" loading="lazy"></div>
                    <div class="news-full-info"><h3>${n.title}</h3><p>${n.excerpt || ''}</p></div>
                </div>`;
    }).join('');
}

// ========== 8. renderContactPage ==========
function renderContactPage() {
    const s = getSettingsData();
    if (!s) return;

    // 优先用 phone，其次 mobile
    const mainContact = s.phone || s.mobile || '';
    const secondaryPhone = (s.phone && s.mobile) ? s.mobile : '';

    // Render contact info column
    const infoCol = document.querySelector('#page-contact .contact-info-col');
    if (infoCol) {
        // 取公司中英文名拆分用于品牌显示
        const enName = 'GC';
        const enRest = 'TECH';
        const cnName = '光辰科技仪器';
        const phoneItem = mainContact ? `
                <div class="contact-item">
                    <div class="contact-item-icon"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                    <div><label>${s.phone ? '联系电话' : '联系手机'}</label><p><a href="tel:${mainContact}">${mainContact}</a></p></div>
                </div>` : '';
        const mobileItem = secondaryPhone ? `
                <div class="contact-item">
                    <div class="contact-item-icon"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></div>
                    <div><label>手机</label><p>${secondaryPhone}</p></div>
                </div>` : '';
        const addressItem = s.address ? `
                <div class="contact-item">
                    <div class="contact-item-icon"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>
                    <div><label>地址</label><p>${s.address}</p></div>
                </div>` : '';
        const emailItem = (s.email || s.email2) ? `
                <div class="contact-item">
                    <div class="contact-item-icon"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></div>
                    <div><label>E-mail</label>${s.email ? `<p>${s.email}</p>` : ''}${s.email2 ? `<p>${s.email2}</p>` : ''}</div>
                </div>` : '';
        const qrSection = s.qrcode ? `
            <div class="contact-divider"></div>
            <div class="contact-qr-section">
                <img src="${s.qrcode}" alt="微信二维码" loading="lazy" class="contact-qr-img">
                <div class="contact-qr-text">
                    <p><strong>${cnName}官方客服</strong></p>
                    <p>欢迎扫码咨询</p>
                </div>
            </div>` : '';
        infoCol.innerHTML = `
            <div class="contact-brand">
                <span class="contact-brand-zep">${enName}</span><span class="contact-brand-tools">${enRest}</span>
                <p class="contact-brand-cn">${cnName}</p>
            </div>
            <div class="contact-items">${phoneItem}${mobileItem}${emailItem}${addressItem}</div>
            ${qrSection}`;
    }

    // Render offices column - 客户没填则显示主要地址
    const officesCol = document.querySelector('#page-contact .contact-offices-col');
    if (officesCol) {
        if (s.offices && s.offices.length) {
            officesCol.innerHTML = `<h2 class="offices-title">公司地址</h2>
                <div class="office-list">
                    ${s.offices.map((o, i) =>
                        (i > 0 ? '<div class="office-divider"></div>' : '') +
                        `<div class="office-item">
                            <div class="office-icon"><img src="${o.icon || ''}" alt="${o.city}" loading="lazy"></div>
                            <div class="office-info"><h4>${o.city}</h4><p>${o.address}</p></div>
                        </div>`
                    ).join('')}
                </div>`;
        } else if (s.address) {
            // 没分公司时，显示主地址
            officesCol.innerHTML = `<h2 class="offices-title">公司地址</h2>
                <div class="office-list">
                    <div class="office-item" style="padding:20px 0">
                        <div class="office-info">
                            <h4>公司总部</h4>
                            <p>${s.address}</p>
                        </div>
                    </div>
                </div>`;
        } else {
            officesCol.innerHTML = '';
        }
    }
}

// ========== 9. renderSearchResults (from CMS data) ==========
function performSearch(query) {
    if (!query || !query.trim()) return;
    query = query.trim().toLowerCase();
    const results = [];

    // Search products
    const products = getProductsData();
    Object.entries(products).forEach(([id, p]) => {
        if ((p.name && p.name.toLowerCase().includes(query)) || (p.desc && p.desc.toLowerCase().includes(query))) {
            results.push({ type: 'product', id: id, title: p.name, desc: p.desc, img: p.img });
        }
    });

    // Search apps
    const apps = getAppsData();
    Object.entries(apps).forEach(([key, a]) => {
        if ((a.name && a.name.toLowerCase().includes(query)) || (a.desc && a.desc.toLowerCase().includes(query))) {
            results.push({ type: 'app', id: key, title: a.name, desc: a.desc, img: a.img });
        }
    });

    // Search news
    const news = getNewsData();
    Object.entries(news).forEach(([key, n]) => {
        if ((n.title && n.title.toLowerCase().includes(query)) || (n.excerpt && n.excerpt.toLowerCase().includes(query))) {
            results.push({ type: 'news', id: key, title: n.title, desc: n.excerpt, img: n.img });
        }
    });

    if (results.length === 0) {
        alert('未找到相关内容');
        return;
    }

    // Navigate to first result
    const r = results[0];
    if (r.type === 'product') navigateTo('product-detail', r.id);
    else if (r.type === 'app') navigateTo('app-detail', r.id);
    else if (r.type === 'news') navigateTo('news-detail', r.id);

    // Close search modal
    document.getElementById('searchModal').classList.remove('open');
}

// ========== 9. renderHomeCulture ==========
function renderHomeCulture() {
    const s = getSettingsData();
    const cultureGrid = document.querySelector('#page-home .culture-grid');
    if (!cultureGrid) return;
    const items = [
        { title: s.missionTitle || '使命', desc: s.missionDesc || '用精密量测赋能科技创新', icon: '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 4L6 14v4h36v-4L24 4z" fill="none" stroke="var(--primary)" stroke-width="2.5"/><rect x="10" y="22" width="4" height="16" rx="1" fill="none" stroke="var(--primary)" stroke-width="2"/><rect x="22" y="22" width="4" height="16" rx="1" fill="none" stroke="var(--primary)" stroke-width="2"/><rect x="34" y="22" width="4" height="16" rx="1" fill="none" stroke="var(--primary)" stroke-width="2"/><rect x="4" y="38" width="40" height="4" rx="1" fill="none" stroke="var(--primary)" stroke-width="2.5"/></svg>' },
        { title: s.visionTitle || '愿景', desc: s.visionDesc || '制造精密仪器，探索微观世界', icon: '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z" fill="none" stroke="var(--primary)" stroke-width="2.5"/><path d="M24 12v12l8 8" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="3" fill="var(--primary)"/></svg>' },
        { title: s.valuesTitle || '核心价值观', desc: s.valuesDesc || '用户至上、合作共赢<br>求实创新、精益求精<br>开放互信、拼搏共进', icon: '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M6 8h28v32H6z" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 14h8v32H14v-6" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 18h16M12 24h16M12 30h10" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/></svg>' }
    ];
    cultureGrid.innerHTML = items.map((item, i) =>
        `<div class="culture-card reveal reveal-delay-${i+1}">
            <div class="culture-card-icon">${item.icon}</div>
            <h3>${item.title}</h3>
            <div class="culture-card-line"></div>
            <p>${item.desc}</p>
        </div>`
    ).join('');
}

// ========== 10. renderAboutPreview ==========
function renderAboutPreview() {
    const s = getSettingsData();
    const textEl = document.querySelector('#page-home .about-preview-text');
    if (textEl && s.aboutIntro) {
        textEl.innerHTML = `<p>${s.aboutIntro}</p>`;
    }
}

// ========== 11. renderAboutPage ==========
function renderAboutPage() {
    const s = getSettingsData();
    // 视频
    const videoCover = document.querySelector('.about-video-cover img');
    if (videoCover && s.aboutVideoThumb) videoCover.src = s.aboutVideoThumb;
    const videoSrc = document.querySelector('.about-video source');
    if (videoSrc && s.aboutVideo) videoSrc.src = s.aboutVideo;
    // 简介文字
    const introText = document.querySelector('.about-intro-text');
    if (introText && s.aboutIntro) introText.innerHTML = `<p>${s.aboutIntro}</p>`;
    // 企业文化
    const aboutCulture = document.querySelector('#page-about .culture-grid');
    if (aboutCulture) {
        const items = [
            { title: s.missionTitle || '使命', desc: s.missionDesc || '用精密量测赋能科技创新' },
            { title: s.visionTitle || '愿景', desc: s.visionDesc || '制造精密仪器，探索微观世界' },
            { title: s.valuesTitle || '核心价值观', desc: s.valuesDesc || '用户至上、合作共赢<br>求实创新、精益求精<br>开放互信、拼搏共进' }
        ];
        aboutCulture.innerHTML = items.map(item =>
            `<div class="culture-card"><div class="culture-card-icon"></div><h3>${item.title}</h3><div class="culture-card-line"></div><p>${item.desc}</p></div>`
        ).join('');
    }
    // 时间线 - 没数据时隐藏整个区块
    const timelineSection = document.querySelector('.about-timeline-section');
    const timeline = document.querySelector('#page-about .timeline');
    if (s.timeline && s.timeline.length) {
        if (timelineSection) timelineSection.style.display = '';
        if (timeline) timeline.innerHTML = s.timeline.map(t =>
            `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><h4>${t.year}</h4><p>${t.text}</p></div></div>`
        ).join('');
    } else {
        if (timelineSection) timelineSection.style.display = 'none';
    }
    // 荣誉资质 - 没数据时隐藏整个区块
    const certSection = document.querySelector('.about-cert-section');
    const certGrid = document.querySelector('#page-about .cert-grid');
    if (s.certs && s.certs.length) {
        if (certSection) certSection.style.display = '';
        if (certGrid) certGrid.innerHTML = s.certs.map(c =>
            `<div class="cert-card"><div class="cert-img"><img src="${c.img}" alt="${c.name}" loading="lazy"></div><p>${c.name}</p></div>`
        ).join('');
    } else {
        if (certSection) certSection.style.display = 'none';
    }
}

// ========== Preloader ==========
window.addEventListener('load', () => {
    applyCmsSettings();
    renderHeroBanners();
    renderHomeProducts();
    renderHomeApps();
    renderHomeNews();
    renderHomeCulture();
    renderAboutPreview();
    // 关键：渲染完成后立即让首屏reveal元素可见，并重新初始化IntersectionObserver
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        initReveal();
    }, 50);
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1400);
});

// ========== Header Scroll ==========
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 80);
    backToTop.classList.toggle('visible', scrollY > 600);
    lastScrollY = scrollY;
});

// ========== Hero Carousel ==========
let heroIndex = 0;
let heroTimer = null;
let heroProgressTimer = null;
let heroSlides = document.querySelectorAll('.hero-slide');
let heroDots = document.querySelectorAll('.hero-dot');
const heroProgressEl = document.getElementById('heroProgress');
const HERO_INTERVAL = 6000;

function reinitHeroCarousel() {
    // Re-query DOM after dynamic rendering
    heroSlides = document.querySelectorAll('.hero-slide');
    heroDots = document.querySelectorAll('.hero-dot');
    heroIndex = 0;
    if (heroSlides.length) resetHeroProgress();
}

function heroGoto(index) {
    if (!heroSlides.length) return;
    heroSlides[heroIndex].classList.remove('active');
    heroDots[heroIndex].classList.remove('active');
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
    heroDots[heroIndex].classList.add('active');

    const activeSlide = heroSlides[heroIndex];
    activeSlide.querySelectorAll('.anim-fade-up, .anim-line-expand').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
    });

    resetHeroProgress();
}

function heroSlide(dir) {
    heroGoto(heroIndex + dir);
}

function resetHeroProgress() {
    clearInterval(heroTimer);
    clearInterval(heroProgressTimer);
    if (!heroProgressEl) return;
    let progress = 0;
    heroProgressEl.style.width = '0%';
    heroProgressTimer = setInterval(() => {
        progress += 100 / (HERO_INTERVAL / 50);
        heroProgressEl.style.width = Math.min(progress, 100) + '%';
    }, 50);
    heroTimer = setTimeout(() => heroGoto(heroIndex + 1), HERO_INTERVAL);
}

if (heroSlides.length) resetHeroProgress();

// ========== Hero Particles ==========
(function initParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('heroParticles');
    if (!container) return;
    container.appendChild(canvas);
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.3 + 0.1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
})();

// ========== Applications Swiper ==========
let appOffset = 0;
const appTrack = document.getElementById('appTrack');

function appSwipe(dir) {
    const track = document.getElementById('appTrack');
    if (!track) return;
    const cards = track.querySelectorAll('.app-card');
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + 20;
    const visible = Math.floor(track.parentElement.offsetWidth / cardWidth);
    const maxOffset = -(cards.length - visible) * cardWidth;

    appOffset += -dir * cardWidth;
    appOffset = Math.max(maxOffset, Math.min(0, appOffset));
    track.style.transform = `translateX(${appOffset}px)`;
}

// ========== Page Navigation (SPA) ==========
function navigateTo(page, section) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    // Handle product detail
    if (page === 'product-detail') {
        showProductDetail(section);
        updateNav('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            // 让详情页所有reveal元素立即可见
            document.querySelectorAll('.page[style*="block"] .reveal').forEach(el => el.classList.add('visible'));
            initReveal();
        }, 50);
        return false;
    }

    // Handle application detail
    if (page === 'app-detail') {
        showAppDetail(section);
        updateNav('applications');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            // 让详情页所有reveal元素立即可见
            document.querySelectorAll('.page[style*="block"] .reveal').forEach(el => el.classList.add('visible'));
            initReveal();
        }, 50);
        return false;
    }

    // Handle news detail
    if (page === 'news-detail') {
        showNewsDetail(section);
        updateNav('news');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            // 让详情页所有reveal元素立即可见
            document.querySelectorAll('.page[style*="block"] .reveal').forEach(el => el.classList.add('visible'));
            initReveal();
        }, 50);
        return false;
    }

    // Track page view
    trackPageView(page);

    // Show target page
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = 'block';

    // Update nav active state
    updateNav(page);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render dynamic content for the target page
    if (page === 'home') {
        renderHeroBanners();
        renderHomeProducts();
        renderHomeApps();
        renderHomeNews();
    }
    if (page === 'products') {
        renderProductsPage();
    }
    if (page === 'applications') {
        renderAppsPage();
    }
    if (page === 'news') {
        renderNewsPage();
    }
    if (page === 'contact') {
        renderContactPage();
    }

    // Re-init reveal — 让当前页面所有reveal元素立即可见
    setTimeout(() => {
        document.querySelectorAll('.page[style*="block"] .reveal').forEach(el => el.classList.add('visible'));
        initReveal();
    }, 50);

    // If about page, animate stats
    if (page === 'about') { renderAboutPage(); setTimeout(animateAboutStats, 600); }

    // If products page with filter
    if (page === 'products' && section) {
        const catMap = { 'sem': 'sem', 'dmd': 'litho', 'ebl': 'litho', 'profiler': 'profiler', 'tem': 'tem', 'nano': 'nano' };
        const cat = catMap[section] || section;
        setTimeout(() => {
            const sidebarItem = document.querySelector(`.sidebar-cat[onclick*="'${cat}'"]`);
            if (sidebarItem) filterProducts(cat, sidebarItem);
        }, 200);
    }

    // If applications page with section, navigate to detail
    if (page === 'applications' && section) {
        // Hide applications page, show detail
        if (target) target.style.display = 'none';
        showAppDetail(section);
        setTimeout(initReveal, 100);
    }

    return false;
}

function updateNav(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');
}

// ========== Product Detail View ==========
function showProductDetail(productId) {
    const detail = document.getElementById('page-product-detail');
    const data = getProductsData()[productId];

    if (!data) {
        // Fallback: show products page
        document.getElementById('page-products').style.display = 'block';
        renderProductsPage();
        return;
    }

    const s = getSettingsData();
    const phone = (s && s.phone) ? s.phone : '18688787186';

    let specsHtml = '';
    if (data.specs) {
        specsHtml = '<table class="detail-specs-table"><tbody>' +
            data.specs.map(s => `<tr><td class="spec-label">${s[0]}</td><td class="spec-value">${s[1]}</td></tr>`).join('') +
            '</tbody></table>';
    }

    let highlightsHtml = '';
    if (data.highlights) {
        highlightsHtml = '<div class="detail-highlights">' +
            data.highlights.map(h => `<div class="detail-highlight-item"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="var(--primary)" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>${h}</span></div>`).join('') +
            '</div>';
    }

    // Get related products (优先同分类，没有则取其他产品)
    let relatedHtml = '';
    let related = Object.entries(getProductsData()).filter(([id, p]) => p.cat === data.cat && id !== productId).slice(0, 4);
    if (related.length === 0) {
        // 同分类没有，取所有其他产品
        related = Object.entries(getProductsData()).filter(([id, p]) => id !== productId).slice(0, 4);
    }
    if (related.length) {
        relatedHtml = '<div class="detail-related"><h3>其他产品</h3><div class="detail-related-grid">' +
            related.map(([id, p]) => `<div class="detail-related-card" onclick="navigateTo('product-detail','${id}')">
                <div class="detail-related-img"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
                <p>${p.name}</p></div>`).join('') +
            '</div></div>';
    }

    detail.innerHTML = `
        <section class="page-banner">
            <div class="page-banner-bg" style="background: linear-gradient(135deg, #001833 0%, #003366 50%, #004c99 100%);"></div>
            <div class="page-banner-content">
                <h1>产品详情</h1>
                <p class="page-banner-en">PRODUCT DETAIL</p>
                <div class="page-breadcrumb"><a href="#" onclick="navigateTo('home');return false">首页</a> / <a href="#" onclick="navigateTo('products');return false">产品中心</a> / ${data.name}</div>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <div class="detail-grid">
                    <div class="detail-img-wrap reveal">
                        <img src="${data.img}" alt="${data.name}">
                    </div>
                    <div class="detail-info reveal reveal-delay-2">
                        <h1 class="detail-title">${data.name}</h1>
                        <div class="detail-divider"></div>
                        <p class="detail-desc">${data.desc}</p>
                        ${highlightsHtml}
                        <div class="detail-actions">
                            <a href="tel:${phone}" class="detail-btn-primary"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> 电话咨询 ${phone}</a>
                            <button class="detail-btn-outline" onclick="navigateTo('contact','message')">在线留言</button>
                        </div>
                    </div>
                </div>
                <div class="detail-specs-section reveal">
                    <h2>技术参数</h2>
                    <div class="detail-specs-divider"></div>
                    ${specsHtml}
                </div>
                ${relatedHtml}
                <div class="detail-inquiry reveal">
                    <h3>获取产品资料</h3>
                    <p>填写您的信息，我们将尽快发送产品资料手册给您。</p>
                    <form class="detail-inquiry-form" onsubmit="event.preventDefault();alert('提交成功！我们将尽快联系您。');this.reset();">
                        <div class="form-row-3">
                            <input type="text" placeholder="您的姓名" required>
                            <input type="tel" placeholder="您的手机" required>
                            <input type="text" placeholder="您的公司">
                        </div>
                        <textarea placeholder="留言内容（选填）" rows="3"></textarea>
                        <button type="submit" class="contact-submit-btn">提交</button>
                    </form>
                </div>
            </div>
        </section>`;
    detail.style.display = 'block';
}

// ========== Application Detail View ==========
function showAppDetail(appKey) {
    const detail = document.getElementById('page-app-detail');
    const data = getAppsData()[appKey];

    if (!data) {
        document.getElementById('page-applications').style.display = 'block';
        renderAppsPage();
        return;
    }

    let articlesHtml = '';
    if (data.articles && data.articles.length) {
        articlesHtml = '<div class="app-detail-articles">' +
            data.articles.map(a => `<div class="app-article-card reveal">
                <div class="app-article-img"><img src="${a.img}" alt="${a.title}" loading="lazy"></div>
                <div class="app-article-info"><h3>${a.title}</h3><p>${a.excerpt}</p></div>
            </div>`).join('') +
            '</div>';
    } else {
        articlesHtml = '<div class="app-detail-empty"><p>更多解决方案正在整理中，敬请期待...</p></div>';
    }

    // Sidebar links
    const sidebarHtml = Object.entries(getAppsData()).map(([key, app]) =>
        `<li class="sidebar-cat ${key === appKey ? 'active' : ''}" onclick="navigateTo('app-detail','${key}')">${app.name}</li>`
    ).join('');

    detail.innerHTML = `
        <section class="page-banner">
            <div class="page-banner-bg" style="background: linear-gradient(135deg, #002244 0%, #003d73 50%, #0066aa 100%);"></div>
            <div class="page-banner-content">
                <h1>热门应用</h1>
                <p class="page-banner-en">APPLICATIONS</p>
                <div class="page-breadcrumb"><a href="#" onclick="navigateTo('home');return false">首页</a> / <a href="#" onclick="navigateTo('applications');return false">热门应用</a> / ${data.name}</div>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <div class="products-page-grid">
                    <aside class="product-sidebar">
                        <h3 class="sidebar-title">应用分类</h3>
                        <ul class="sidebar-cat-list">${sidebarHtml}</ul>
                    </aside>
                    <div class="product-main">
                        <div class="app-detail-banner reveal">
                            <div class="app-detail-banner-img"><img src="${data.img}" alt="${data.name}" loading="lazy"></div>
                            <div class="app-detail-banner-content">
                                <h2>${data.name}</h2>
                                <div class="app-detail-banner-line"></div>
                                <p>${data.desc}</p>
                            </div>
                        </div>
                        <div class="app-detail-section reveal">
                            <div class="app-detail-section-header">
                                <h2>解决方案</h2>
                                <p class="app-detail-section-en">Solution</p>
                            </div>
                            ${articlesHtml}
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
    detail.style.display = 'block';
}

// ========== News Detail View ==========
function showNewsDetail(newsKey) {
    const detail = document.getElementById('page-news-detail');
    const data = getNewsData()[newsKey];

    if (!data) {
        document.getElementById('page-news').style.display = 'block';
        renderNewsPage();
        return;
    }

    // Related news sidebar
    const relatedNews = Object.entries(getNewsData()).filter(([k]) => k !== newsKey).slice(0, 3);
    const relatedHtml = relatedNews.map(([k, n]) =>
        `<div class="news-sidebar-item" onclick="navigateTo('news-detail','${k}')">
            <h4>${n.title}</h4><span>${n.date}</span>
        </div>`
    ).join('');

    detail.innerHTML = `
        <section class="page-banner">
            <div class="page-banner-bg" style="background: linear-gradient(135deg, #0d1b2a 0%, #1b3a5c 50%, #2a5a8c 100%);"></div>
            <div class="page-banner-content">
                <h1>资讯中心</h1>
                <p class="page-banner-en">NEWS CENTER</p>
                <div class="page-breadcrumb"><a href="#" onclick="navigateTo('home');return false">首页</a> / <a href="#" onclick="navigateTo('news');return false">资讯中心</a> / 详情</div>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <div class="news-detail-grid">
                    <div class="news-detail-main reveal">
                        <h1 class="news-detail-title">${data.title}</h1>
                        <div class="news-detail-meta">
                            <span class="news-detail-date"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg> ${data.date}</span>
                        </div>
                        <div class="news-detail-content">${data.content}</div>
                        <div class="news-detail-back">
                            <button onclick="navigateTo('news')" class="detail-btn-outline">< 返回列表</button>
                        </div>
                    </div>
                    <aside class="news-detail-sidebar reveal reveal-delay-2">
                        <h3>相关新闻</h3>
                        <div class="news-sidebar-list">${relatedHtml}</div>
                    </aside>
                </div>
            </div>
        </section>`;
    detail.style.display = 'block';
}

// ========== Product Filter ==========
function filterProducts(cat, btn) {
    // 使用分页渲染，重置到第1页
    renderProductsPage(1, cat);
}

// ========== News Tab Switch ==========
function switchNewsTab(btn, tab) {
    document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

// ========== About Video ==========
function playAboutVideo(cover) {
    const wrap = cover.parentElement;
    const video = wrap.querySelector('video');
    if (video) {
        cover.style.display = 'none';
        video.style.display = 'block';
        video.play();
    }
}

// ========== About Stats Animation ==========
function animateAboutStats() {
    document.querySelectorAll('.about-stat-num[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current);
        }, 30);
    });
}

// ========== Contact Form ==========
function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        company: formData.get('company') || '',
        email: formData.get('email') || '',
        message: formData.get('message') || '',
        time: new Date().toLocaleString('zh-CN'),
        source: location.href
    };

    // 1) Store in CMS messages
    if (typeof CMS !== 'undefined') {
        const msgs = CMS.getMessages();
        msgs.unshift(data);
        CMS.saveMessages(msgs);
    }

    // 2) Send via EmailJS if configured
    const settings = (typeof CMS !== 'undefined') ? CMS.getSettings() : {};
    const emailCfg = settings.emailjs || {};

    if (emailCfg.serviceId && emailCfg.templateId && emailCfg.publicKey && typeof emailjs !== 'undefined') {
        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.textContent;
        btn.textContent = '发送中...';
        btn.disabled = true;

        emailjs.send(emailCfg.serviceId, emailCfg.templateId, {
            from_name: data.name,
            from_phone: data.phone,
            from_company: data.company,
            from_email: data.email,
            message: data.message,
            submit_time: data.time,
            to_email: settings.email || '17688292259@163.com'
        }, emailCfg.publicKey).then(function() {
            alert('留言已提交并发送至邮箱，感谢您的反馈！');
            form.reset();
            btn.textContent = btnText;
            btn.disabled = false;
        }, function(err) {
            console.error('EmailJS error:', err);
            alert('留言已保存！邮件发送失败，我们会尽快查看后台留言。');
            form.reset();
            btn.textContent = btnText;
            btn.disabled = false;
        });
    } else {
        // EmailJS not configured, save locally only
        alert('感谢您的留言！我们会尽快与您联系。');
        form.reset();
    }
    return false;
}

// ========== Scroll Reveal ==========
function initReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.visible)');
    // 立即让首屏内已经可见的元素显示（不等滚动）
    reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        }
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 100px 0px' });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
initReveal();

// ========== Search ==========
function toggleSearch() {
    const modal = document.getElementById('searchModal');
    modal.classList.toggle('open');
    if (modal.classList.contains('open')) document.getElementById('searchInput').focus();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.getElementById('searchModal').classList.remove('open');
    if (e.key === 'Enter' && document.getElementById('searchModal').classList.contains('open')) {
        performSearch(document.getElementById('searchInput').value);
    }
});

// Search submit button
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.querySelector('.search-submit-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            performSearch(document.getElementById('searchInput').value);
        });
    }
});

// ========== Mobile Nav ==========
function toggleMobileNav() {
    document.getElementById('mobileNav').classList.toggle('open');
    document.getElementById('mobileOverlay').classList.toggle('open');
}

// ========== Smooth Scroll ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ========== BroadcastChannel 实时同步 ==========
if (typeof BroadcastChannel !== 'undefined') {
    const cmsListener = new BroadcastChannel('cms_update');
    cmsListener.onmessage = function(event) {
        // Re-apply CMS settings
        applyCmsSettings();
        // Re-render current visible page
        const visiblePage = document.querySelector('.page[style*="display: block"], .page[style="display:block"], #page-home');
        if (visiblePage) {
            const pageId = visiblePage.id.replace('page-', '');
            if (pageId === 'home' || visiblePage.id === 'page-home') {
                renderHeroBanners();
                renderHomeProducts();
                renderHomeApps();
                renderHomeNews();
                renderHomeCulture();
                renderAboutPreview();
            } else if (pageId === 'products') {
                renderProductsPage();
            } else if (pageId === 'applications') {
                renderAppsPage();
            } else if (pageId === 'news') {
                renderNewsPage();
            } else if (pageId === 'contact') {
                renderContactPage();
            } else if (pageId === 'about') {
                renderAboutPage();
            }
        }
    };
}
