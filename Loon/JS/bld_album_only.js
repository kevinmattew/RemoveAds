// bld_album_only.js
// 专注解锁个人主页隐私相册权限 + 模拟VIP查看
// 修复了导致聊天无网络、列表不刷新的bug

const environmentInstance = new Env("Blued隐私相册优化版");

(async () => {
  try {
    const currentUrl = $request.url;
    
    // 逻辑分流：只处理 basic (基础信息) 和 more (详细信息/相册)
    if (currentUrl.includes("/basic")) {
        handleBasicInfo();
    } else if (currentUrl.includes("/more")) {
        handleMoreInfo();
    } else {
        // 其他所有请求直接放行，确保聊天和列表正常
        $done({});
    }

  } catch (e) {
    console.log("脚本执行异常: " + e);
    $done({});
  }
})();

// 处理基础信息 (Basic)
function handleBasicInfo() {
  try {
    const body = JSON.parse($response.body);
    if (body.data && body.data.length > 0) {
      // 强制修改锁定状态
      Object.assign(body.data[0], {
        "privacy_photos_has_locked": 0, // 0表示未锁定
        "is_hide_last_operate": 0,      // 显示最后登录时间
        "is_global_view_secretly": 1    // 悄悄查看
      });
    }
    $done({ body: JSON.stringify(body) });
  } catch (e) {
    $done({});
  }
}

// 处理详细信息 (More - 核心相册权限在这里)
function handleMoreInfo() {
  try {
    const body = JSON.parse($response.body);
    if (body.data && body.data.length > 0) {
      const userData = body.data[0];
      
      // 1. 模拟 VIP 身份 (欺骗客户端显示)
      if (userData.user) {
        Object.assign(userData.user, {
          "is_vip_annual": 1,
          "vip_grade": 1,
          "expire_time": 2536525808
        });
      }

      // 2. 尝试解锁相册权限
      // 注意：如果服务器严格校验，单纯改这个可能只能看到缩略图或空白，但这是客户端能做的极限
      Object.assign(userData, {
        "privacy_photos_has_locked": 0,  // 修改为未锁定
        "is_access_private_photos": 1,   // 修改为有权访问
        "is_traceless_access": 1         // 无痕访问
      });

      // 3. 移除界面上的广告干扰
      const rubbish = ["banner", "service", "healthy_ad", "game_center"];
      rubbish.forEach(key => delete userData[key]);
    }
    $done({ body: JSON.stringify(body) });
  } catch (e) {
    $done({});
  }
}

// 简易环境类
function Env(name) {
  return new class {
    constructor(name) { this.name = name; }
    done(data = {}) { $done(data); }
  }(name);
}