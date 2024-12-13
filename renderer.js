// renderer.js
const { ipcRenderer } = require("electron");

// 从 localStorage 中获取缓存的值，如果没有则使用默认值
let username = localStorage.getItem("username") || "";
let password = localStorage.getItem("password") || "";
let networkType = localStorage.getItem("network-type") || "0";
let url = localStorage.getItem("url") || "172.21.0.54";
let online = false;

document.addEventListener("DOMContentLoaded", () => {
  // 将缓存的值填充到输入框中
  document.getElementById("url").value = url;
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;
  document.getElementById("network-type").value = networkType;

  // 为输入框添加 input 事件监听器
  document.getElementById("url").addEventListener("input", (event) => {
    url = event.target.value;
    localStorage.setItem("url", event.target.value);
  });

  document.getElementById("username").addEventListener("input", (event) => {
    username = event.target.value;
    localStorage.setItem("username", event.target.value);
  });

  document.getElementById("password").addEventListener("input", (event) => {
    password = event.target.value;
    localStorage.setItem("password", event.target.value);
  });

  document.getElementById("network-type").addEventListener("change", (event) => {
    networkType = event.target.value;
    localStorage.setItem("network-type", event.target.value);
  });

  const deviceBtn = document.querySelector(".device-btn");
  if (deviceBtn) {
    deviceBtn.addEventListener("click", handleGetDeviceListButton);
  }

  const loginBtn = document.querySelector(".login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleLoginButton);
  }

  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogoutButton);
  }

  regularGetStatus();
});

async function handleLoginButton() {
  if (!username || !password) {
    updateStatusCard("请输入用户名和密码");
    return;
  }

  updateStatusCard("登录中...");

  try {
    const result = await ipcRenderer.invoke(
      "login",
      username,
      password,
      networkType,
      url
    );

    if (result.success) {
      updateStatusCard("登录成功");
      location.reload();
    } else {
      throw new Error(result);
    }
  } catch (error) {
    updateStatusCard("登录失败");
  }
}

async function handleLogoutButton() {
  updateStatusCard("登出中...");
  try {
    const result = await ipcRenderer.invoke("logout", url);

    if (result.success) {
      updateStatusCard("登出成功");
      location.reload();
    } else {
      throw new Error(result);
    }
  } catch (error) {
    updateStatusCard("登出失败");
  }
}

async function handleGetDeviceListButton() {
  const deviceListElement = document.getElementById("device-list");

  try {
    const result = await ipcRenderer.invoke("get-device-list", username, url);
    console.log("获取设备列表完整结果:", result);
    document.querySelector(".device-list").innerHTML = `${result.toString()}`;

    if (result.success) {
      if (result.data.result === 1 && Array.isArray(result.data.list)) {
        updateDeviceListStatus(result.data.list, "success");
      } else {
        throw new Error("无设备数据");
      }
    } else {
      throw new Error("获取设备列表失败");
    }
  } catch (error) {
    updateDeviceListStatus(error.message, "error");
  }
}


async function regularGetStatus() {
    const getStatus = async () => {
        try {
            const result = await ipcRenderer.invoke("get-current-status", url);
        
            if (result.success) {
              const timestamp = new Date().toLocaleTimeString();
              online = true;
              updateStatusCard(`当前已登录 - ${timestamp}`);
            } else {
              throw new Error(result);
            }
          } catch (error) {
            online = false;
            const timestamp = new Date().toLocaleTimeString();
            updateStatusCard(`当前未登录 - ${timestamp}`);
          }
    }

    getStatus();
    setInterval(() => {
        getStatus();
    }, 60000);
}





function updateStatusCard(msg) {
  const statusElement = document.querySelector(".status-card");

  statusElement.innerHTML = `
        <div>
            ${msg}
        </div>
    `;
}

// 更新设备列表状态
function updateDeviceListStatus(items, type = "success") {
  const colors = {
    error: "#17a2b8",
    success: "#28a745",
  };
  const deviceListElement = document.getElementById("device-list");
  let deviceListHtml = ``;

  if (type === "success") {
    for (let i = 0; i < items.length; i++) {
      deviceListHtml += `
                <div style="
                    padding: 12px;
                    color: ${colors[type]};
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid ${colors[type]}20;
                ">
                    <b>账户</b>
                    ${items[i].user_account}
                    <b>IP 地址</b>
                    ${items[i].online_ip}
                    <b>Mac 地址</b>
                    ${items[i].online_mac}
                    <b>上传 / 下载 (bytes)</b>
                    ${items[i].uplink_bytes} / ${items[i].downlink_bytes}
                    <b>登录时间</b>
                    ${items[i].online_time}
                </div>
            `;
    }

    deviceListHtml = `<div
            style="
                display: flex;
                flex-direction: column;
                gap: 12px;
            "
        >
            ${deviceListHtml}
        </div>`;
  } else if (type === "error") {
    deviceListHtml = `
        <div style="
            padding: 12px;
            color: ${colors[type]};
            text-align: center;
            background: white;
            border-radius: 8px;
            border: 1px solid ${colors[type]}20;
        ">
            ${items}
        </div>
    `;
  }

  deviceListElement.innerHTML = deviceListHtml;
}
