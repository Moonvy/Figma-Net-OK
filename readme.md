# FigmaNetOK 2

<p align="center">
  <img  height="100" src="https://github.com/Moonvy/Figma-Net-OK/raw/master/logo.png">
</p>

让 Figma 网络速度访问速度更快的方法（尤其是在 🇨🇳 中国）

- 不使用翻墙
- 仅更改本地 Hosts 配置
- **🔥 2.0 以上版可自动一键修改 Hosts 配置**

Figma 有不同的服务器，通常你的系统会自动选择 Figma 的服务地址，有些时候因为运营商、Figma 服务状态、DNS 设置等等原因，自动选择的 Figma 服务地址可能不是最好的（有时候可能速度相差 10 倍），所以这个工具能帮你测试在你的环境下所有 Figma 服务地址的真实速度（不是 ping 而是真实连接速度），这样你就可以通过修改 Hosts 的办法指定一个最快的 Figma 服务地址

<p align="center">
  <img  height="400" src="https://github.com/Moonvy/Figma-Net-OK/raw/master/FigmaNetOK-CLI%E6%BC%94%E7%A4%BA2.gif">
</p>


## 使用

### 下载 (v2.3.0)

- [发布页](https://github.com/Moonvy/Figma-Net-OK/releases)
- [Windows](https://moonvy.lanzouy.com/i26BY0kja7cj)
- [MacOS](https://moonvy.lanzouy.com/iEqmT0kja5oj)

#### MacOS 下无法启动的问题

- **授权设置**  
  前往系统偏好设置 > 安全性与隐私 > 允许访问，如果仍然提示无法打开可再次打开允许访问授权

#### Windows 下无 Hosts 写入权限的问题

- **解决办法**  
 [使用手动修改 Hosts 的方式](https://baike.baidu.com/item/hosts/10474546)
  
 


### 使用步骤

1. 解压并运行文件「**FigmaNetOK**」
2. 测速中，等待一会
3. 得到最佳线路的 Hosts 配置
    - 你可以授予管理员权限一键修改 Hosts
    - 也可以把复制运行结果，手动去修改 Hosts 文件  
       <img  width="600" src="https://user-images.githubusercontent.com/82231420/148732714-9ed8a3f7-6998-4330-b392-515a08b769be.png">

4. 重启 Figma 客户端或浏览器，就完成了


 

## 常见问题

### 如何确定 Hosts 是否生效

- **浏览器检查**

1. 浏览器窗口右上角「更多」 > 更多工具 > 开发者工具
2. 刷新网页
3. 找到参数：Network/state/Remote Addrese：X.X.X.X:XX 和你添加的 Hosts 对比，是相同的，代表已经使用成功
<p align="center">
  <img  width="500" src="https://user-images.githubusercontent.com/82380792/130445924-288acfa7-ce2b-4b77-9248-62755bc5040b.png">
</p>

- **Figma 客户端检查**

1. Figma 客户端：右键菜单 > Plugins（插件） > Development（开发） > Open console（控制台）
2. 刷新页面（在标签上，右键 Reload Tab ）
3. 找到参数：Network/state/Remote Addrese：X.X.X.X:XX 和你添加的 Hosts 对比，是相同的，代表已经使用成功
 <p align="center">
  <img  width="500" src="https://user-images.githubusercontent.com/82380792/130446934-7e6109cb-52b9-40d6-91f7-927be9f457f1.png">
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

> [参考](https://sysin.org/blog/clear-browser-dns-cache/?__cf_chl_managed_tk__=pmd_qS0UzxTZ9PfLZXDgeWWyQolML5wgzVPc.nF.3ABD_qs-1629715174-0-gqNtZGzNAtCjcnBszQiR)

 

### 手动修改 Hosts

FigmaNetOK 2.0 以后的版本可以支持自动修改 Hosts 了，你不再需要手动去修改 Hosts 文件了。不过如果想要更多了解 Hosts 文件，可以参考以下内容：

- [「SwitchHosts」](https://swh.app/zh)修改和管理 Hosts 很方便（Mac、Win、Linux 都支持）
- [手动修改 Hosts](https://baike.baidu.com/item/hosts/10474546)
