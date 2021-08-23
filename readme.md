# FigmaNetOK
 
<p align="center">
  <img  height="100" src="https://github.com/Moonvy/Figma-Net-OK/raw/master/logo.png">
</p>


让 Figma 网络速度访问速度更快的方法（尤其是在 🇨🇳 中国）

- 不使用翻墙
- 更改本地 Host 配置

Figma 有不同的服务器，根据你 DNS 服务，你会自动选择 Figma 的服务地址，有些时候因为运营商、Figma 服务状态、本地 DNS 设置等等原因，你自动选择的 Figma 服务地址可能不是最好的（有时候可能速度相差 10 倍），所以这个工具能帮你测试在你的环境下所有 Figma 服务地址的真实速度（不是 ping 而是真实连接速度），这样你就可以通过修改 Host 的办法指定一个最快的  Figma 服务地址



<p align="center">
  <img  height="400" src="https://github.com/Moonvy/Figma-Net-OK/raw/master/FigmaNetOK-CLI%E6%BC%94%E7%A4%BA.gif">
</p>


 


## 使用

### 下载

- [发布页](https://github.com/Moonvy/Figma-Net-OK/releases)
- [Windows](https://moonvy.lanzoui.com/i3xOwt288tg)
- [MacOS](https://moonvy.lanzoui.com/i0IGRt289cf)

### MacOS 下无法启动的问题

- **授权设置**  
 前往系统偏好设置 > 安全性与隐私 > 允许访问，如果仍然提示无法打开可再次打开允许访问授权

### 测速


### 修改 Host
- [使用 SwitchHosts 修改](https://swh.app/zh) `https://swh.app/zh`
  推荐使用该工具，修改和管理 Hosts 很方便（Mac、Win、Linux 都支持）
- [手动修改](https://www.jianshu.com/p/752211238c1b)


## 常见问题


### 如果确定 Host 是否生效
- **浏览器检查**
1. 浏览器窗口右上角「更多」 > 更多工具 > 开发者工具
2. 刷新网页
3. 找到参数：Network/state/Remote Addrese：X.X.X.X:XX 和你添加的 Hosts 对比，是相同的，代表已经使用成功
<p align="center">
  <img  height="480" src="https://user-images.githubusercontent.com/82380792/130445924-288acfa7-ce2b-4b77-9248-62755bc5040b.png">
</p>

- **Figma客户端检查**
1. Figma 客户端：右键菜单 > Plugins（插件） > Development（开发） > Open console（控制台）
2. 刷新页面（在标签上，右键 Reload Tab ）
3. 找到参数：Network/state/Remote Addrese：X.X.X.X:XX 和你添加的 Hosts 对比，是相同的，代表已经使用成功
 <p align="center">
  <img  height="380" src="https://user-images.githubusercontent.com/82380792/130446934-7e6109cb-52b9-40d6-91f7-927be9f457f1.png">
</p>

### 刷新浏览器的 DNS 缓存
有些情况下修改 Host 后，因为浏览器有缓存所以没有立即生效，这时候可以手动刷新浏览器缓存

- **Google Chrome**  
 在地址栏输入以下地址 `chrome://net-internals/#dns` 回车，点击 Clear host cache 即可
- **Microsoft Edge**  
 在地址栏输入以下地址 `edge://net-internals/#dns` 回车，点击 Clear host cache 即可
- **Safari**  
  菜单栏 “Safari 浏览器” –> “偏好设置…” –> “高级”，“在菜单栏中显示 “开发” 菜单。
  此时，点击菜单栏 ”开发“ –> ”清空缓存“ 即可。

> 参考：https://sysin.org/blog/clear-browser-dns-cache/?__cf_chl_managed_tk__=pmd_qS0UzxTZ9PfLZXDgeWWyQolML5wgzVPc.nF.3ABD_qs-1629715174-0-gqNtZGzNAtCjcnBszQiR

