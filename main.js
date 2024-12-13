const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const { login, logout, getDeviceList, getCurrentStatus } = require("./utils");

if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
  });
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  win.loadFile("index.html");
  win.setIcon(path.join(__dirname, "icon.png"));

  // Handle the close event to quit the app
  win.on("close", () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 登录处理逻辑
ipcMain.handle("login", async (event, username, password, networkType, url) => {
  return await login({ username, password, networkType }, url);
});

ipcMain.handle("logout", async (event, url) => {
  return await logout(url);
});

// 添加获取设备列表的处理逻辑
ipcMain.handle("get-device-list", async (event, username, url) => {
  return await getDeviceList({ username }, url);
});

ipcMain.handle("get-current-status", async (event, url) => {
  return await getCurrentStatus(url);
});
