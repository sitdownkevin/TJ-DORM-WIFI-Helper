const axios = require("axios");
const cheerio = require("cheerio");

const url = "172.21.0.54";

async function login({ username, password, networkType }, url=url) {
  try {
    // 构建登录参数
    const loginParams = {
      callback: "dr1003",
      DDDDD: username,
      upass: password,
      "0MKKey": "123456",
      R1: "0",
      R2: "",
      R3: networkType || "0",
      R6: "0",
      para: "00",
      v6ip: "",
      terminal_type: "1",
      lang: "zh-cn",
      jsVersion: "4.1",
      v: "2653",
      lang: "zh",
    };

    // 构建URL参数字符串
    const queryString = Object.entries(loginParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    const loginUrl = `http://${url}/drcom/login?${queryString}`;

    // 发送登录请求
    const response = await axios.get(loginUrl, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const dataString = response.data.match(/dr1003\s*\((.*)\)\s*;?/)[1];
    const data = JSON.parse(dataString);

    const success = data.result === 1;
    if (!success) {
      throw new Error("data.result = 0");
    }

    // 返回登录结果
    return {
      success: true,
      message: "登录成功",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: "登录失败",
      error: error.toString(),
    };
  }
}

async function logout(url=url) {
  try {
    const logoutUrl = `http://${url}/drcom/logout?callback=dr1006`;
    // 发送登出请求
    const response = await axios.get(logoutUrl, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const dataString = response.data.match(/dr1006\s*\((.*)\)\s*;?/)[1];
    const data = JSON.parse(dataString);

    const success = data.result === 1;
    if (!success) {
      throw new Error("data.result = 0");
    }

    // 返回登出结果
    return {
      success: true,
      message: "登出成功",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: "登出失败",
      error: error.toString(),
    };
  }
}

async function getDeviceList({ username }, url=url) {
  try {
    const deviceListUrl = `http://${url}:801/eportal/portal/mac/find?callback=dr1002&user_account=${username}`;

    // 发送设备列表请求
    const response = await axios.get(deviceListUrl, {
      timeout: 5000,
      headers: {
        Host: `${url}:801`,
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Sec-GPC": "1",
        "Accept-Language": "zh-CN,zh",
        Referer: `http://${url}/`,
      },
    });

    // 解析返回的数据
    const dataString = response.data.match(/dr1002\s*\((.*)\)\s*;?/)[1];
    const data = JSON.parse(dataString);
    if (!data.result) {
      throw new Error(data.msg);
    }

    // console.log("设备列表数据:", data);

    return {
      success: true,
      message: "设备列表获取成功",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: "获取设备列表失败",
      error: error.toString(),
    };
  }
}

async function getCurrentStatus(url=url) {
    try {
        const deviceListUrl = `http://${url}:801/eportal/portal/mac/find?callback=dr1002`;
    
        // 发送设备列表请求
        const response = await axios.get(deviceListUrl, {
          timeout: 5000,
          headers: {
            Host: `${url}:801`,
            Connection: "keep-alive",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            Accept: "*/*",
            "Sec-GPC": "1",
            "Accept-Language": "zh-CN,zh",
            Referer: `http://${url}/`,
          },
        });
    
        // 解析返回的数据
        const dataString = response.data.match(/dr1002\s*\((.*)\)\s*;?/)[1];
        const data = JSON.parse(dataString);
        if (!data.result) {
          throw new Error(data.msg);
        }
    
        // console.log("设备列表数据:", data);
    
        return {
          success: true,
          message: "当前已登录",
        };
      } catch (error) {
        return {
          success: false,
          message: "当前未登录",
        //   error: error.toString(),
        };
      }
}


module.exports = {
  login,
  logout,
  getDeviceList,
  getCurrentStatus,
};


