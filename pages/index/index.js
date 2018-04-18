Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpen: false,
    unpaired: [],
    noPaired: '',
    isConnectDeviceId: null,
    currentConnectDeviceId: null,
    bluetoothAllId: []
  },
  //点击开关
  switch() {
    var that = this;
    var unpaired = [];
    that.data.unpaired.map((item) => {
      item.status = '';
      unpaired.push(item);
    })
    this.setData({
      unpaired: unpaired,
      isOpen: !this.data.isOpen
    })
    if (that.data.isOpen) {
      //打开蓝牙适配器
      that.openBluetoothAdapter();
      //获取蓝牙适配器状态
      // that.getBluetoothAdapterState();
      //监听蓝牙适配器状态的改变
      // that.onBluetoothAdapterStateChange();
    } else {
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log(res);
          console.log('蓝牙适配器关闭');
        },
      })
      that.setData({
        unpaired: [],
        noPaired: '',
        isConnectDeviceId: null,
        currentConnectDeviceId: null,
        bluetoothAllId: []
      })
    }
  },
  //连接
  toPaired(e) {
    console.log(e);
    var that = this;
    var currentList = 'unpaired[' + e.currentTarget.id + '].status';
    if (that.data.unpaired[e.currentTarget.id].status == '') {
      var unpaired = [];
      that.data.unpaired.map((item) => {
        item.status = '';
        unpaired.push(item);
      })
      that.setData({
        unpaired: unpaired,
        [currentList]: '正在建立连接...',
        isConnectDeviceId: e.currentTarget.dataset.deviceid
      })
      if (that.data.currentConnectDeviceId != null) {
        //断开蓝牙连接
        that.closeBLEConnection(currentList, e.currentTarget.dataset.deviceid);
      } else {
        //蓝牙连接
        that.createBLEConnection(currentList, e.currentTarget.dataset.deviceid);
      }
    }

  },
  // 打开蓝牙适配器
  openBluetoothAdapter() {
    var that = this;
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res);
        that.getBluetoothAdapterState();
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '请先检查手机蓝牙是否开启',
          icon: 'none',
          duration: 1000
        })
        setTimeout(() => {
          that.setData({
            isOpen: false
          })
        }, 100)
      }
    })
  },
  //获取蓝牙适配器状态
  getBluetoothAdapterState() {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log(res);
        that.onBluetoothAdapterStateChange();
        if (res.available) {
          // 搜索附近蓝牙设备
          that.startBluetoothDevicesDiscovery();
          // 监听发现新设备
          that.onBluetoothDeviceFound();
          //获取搜索到的设备
          setTimeout(function() {
            that.getBluetoothDevices();
          }, 5000)
        } else {
          wx.showToast({
            title: '蓝牙不可用',
            icon: 'none',
            duration: 1000
          })
          setTimeout(() => {
            that.setData({
              isOpen: false
            })
          }, 100)
        }
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '未初始化蓝牙适配器',
          icon: 'none',
          duration: 1000
        })
        setTimeout(() => {
          that.setData({
            isOpen: false
          })
        }, 100)
      }
    })
  },
  //监听蓝牙适配器状态的改变
  onBluetoothAdapterStateChange() {
    var that = this;
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res);
      if (res.discovering) {

      } else {
        console.log('已停止搜索附近蓝牙设备');
      } 
      if(!res.available) {
        that.setData({
          isOpen: false
        })
        wx.closeBluetoothAdapter({
          success: function (res) {
            console.log(res);
            console.log('蓝牙适配器关闭');
          },
        })
      }
    })
  },
  //搜索附近蓝牙设备
  startBluetoothDevicesDiscovery() {
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        wx.showToast({
          title: '搜索失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  // 停止搜索附近蓝牙
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res);
        console.log('已停止搜索蓝牙设备');
      },
    })
  },
  //获取搜索到的蓝牙设备
  getBluetoothDevices() {
    var that = this;
    wx.getBluetoothDevices({
      success: function(res) {
        console.log(res);
        var devices = [];
        res.devices.forEach(function (item) {
          item.status = '';
          devices.push(item);
        })
        that.setData({
          unpaired: devices
        })
        if (devices.length == 0) {
          that.setData({
            noPaired: '附近暂无设备~'
          })
        }
      },
    })
  },
  //监听寻找到新设备的事件
  onBluetoothDeviceFound() {
    var that = this;
    wx.onBluetoothDeviceFound(function (res) {
      console.log(res.devices[0]);
      console.log('----找到新设备----');
      console.log('新设备名称：' + res.devices[0].name);
      console.log('新设备deviceID：' + res.devices[0].deviceId);
      //获取搜索到的设备
      that.getBluetoothDevices();
    })
  },
  // 连接低功耗蓝牙设备
  createBLEConnection(currentList, deviceId) {
    var that = this;
    console.log(deviceId);
    wx.createBLEConnection({
      deviceId: deviceId,
      success: function(res) {
        console.log(res);
        console.log('已经成功与' + deviceId + '建立连接');
        that.setData({
          [currentList]: '已连接',
          currentConnectDeviceId: deviceId
        })
        // 停止搜索附近蓝牙设备
        that.stopBluetoothDevicesDiscovery();
        // 监听蓝牙连接状态
        that.onBLEConnectionStateChange(currentList);
        //获取蓝牙设备所有服务
        that.getBLEDeviceServices(deviceId);
      },
      fail: function(res) {
        console.log(res);
        console.log('连接建立失败');
        that.setData({
          [currentList]: '连接建立失败'
        })
        setTimeout(function () {
          that.setData({
            [currentList]: ''
          })
        }, 1000)
      }
    })
  },
  // 断开连接低功耗蓝牙设备
  closeBLEConnection(currentList, deviceId) {
    var that = this;
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: function(res) {
        console.log(res);
        console.log('连接已断开');
        //进行下一个蓝牙连接
        that.createBLEConnection(currentList, deviceId);
      },
      fail: function(res) {
        console.log(res);
        console.log('连接断开失败')
      }
    })
  },
  //监听蓝牙连接状态
  onBLEConnectionStateChange(currentList) {
    var that = this;
    var deviceId = that.data.isConnectDeviceId;
    wx.onBLEConnectionStateChange(function(res){
      console.log(res);
      if(!res.connected) {
        that.setData({
          [currentList]: '连接已断开'
        })
        setTimeout(function() {
          that.setData({
            [currentList]: ''
          })
        }, 1000)
      } else {
        that.setData({
          [currentList]: '已连接'
        })
      }
    })
  },
  // 获取蓝牙设备所有服务
  getBLEDeviceServices(deviceId) {
    var that = this;
    that.setData({
      bluetoothAllId: []
    })
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function(res) {
        console.log(res);
        res.services.forEach(function(item) {
          // 获取服务对应的特征值
          that.getBLEDeviceCharacteristics(deviceId, item.uuid);
        })
        setTimeout(function() {
          console.log(that.data.bluetoothAllId);
          // 读取特征值对应的数据
          that.readBLECharacteristicValue();
        }, 500)
      },
      fail: function(res) {
        console.log('获取蓝牙服务失败');
      }
    })
  },
  // 获取蓝牙服务对应的特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    var that = this; 
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: serviceId,
      success: function(res) {
        console.log('获取特征值成功');
        console.log(res);
        var bluetoothAllId = {
          deviceId: deviceId,
          serviceId: serviceId,
          characteristicId: res.characteristics
        }
        bluetoothAllId.deviceId = deviceId;
        bluetoothAllId.serviceId = serviceId;
        bluetoothAllId.characteristicId = res.characteristics;
        console.log(that.data.bluetoothAllId);
        console.log(bluetoothAllId);
        var id = that.data.bluetoothAllId;
        id = id.push(bluetoothAllId);
        setTimeout(function() {
          that.setData({
            bluetoothAllId: id
          })
        }, 1000)
      },
      fail: function(res) {
        console.log('获取特征值失败');
        console.log(res);
      }
    })
  },
  //读取蓝牙设备特征值对应的数据
  readBLECharacteristicValue() {
    var that = this;
    var characterId = that.data.bluetoothAllId;
    console.log(characterId);
    characterId.forEach(function(item1) {
      item1.characteristicId.forEach(function(item2) {
        console.log(item2);
        if(item2.properties.read) {
          wx.readBLECharacteristicValue({
            deviceId: item1.deviceId,
            serviceId: item1.serviceId,
            characteristicId: item2.uuid,
            success: function(res) {
              console.log('读取特征值对应的数据成功');
              console.log(res);
            },
            fail: function(res) {
              console.log('读取特征值对应的数据失败');
              console.log(res);
            }
          })
        }
        // 启用notify功能
        that.notifyBLECharacteristicvalueChange(item1, item2);
      })
    })
  },
  //启用notify功能
  notifyBLECharacteristicvalueChange(item1, item2) {
    console.log(item1);
    console.log(item2);
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      deviceId: item1.deviceId,
      serviceId: item1.serviceId,
      characteristicId: item2.uuid,
      state: true,
      success: function(res) {
        console.log('启用notify成功');
        console.log(res);
        that.onBLECharacteristicValueChange();
      },
      fail: function(res) {
        console.log('启用notify失败');
      }
    })
  },
  // 监听特征值变化
  onBLECharacteristicValueChange() {
    var that = this;
    wx.onBLECharacteristicValueChange(function(res){
      console.log('特征值变化了');
      console.log(res);
    })
  },
  //
  connect() {
    wx.getConnectedBluetoothDevices({
      success: function(res) {
        console.log(res);
      },
    })
  }
})