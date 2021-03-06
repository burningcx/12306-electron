import Vue from 'vue'

/**
 * 获取登录用户
 * @param {*} userName 账号
 */
const getLoginModel = (userName) => {
  const data = getLocalStorage('LOGINMODEL') || []

  if (userName) {
    return data.filter(item => item.userName === userName || item.loginName === userName) || []
  }

  return data
}

/**
 * 保存登录用户
 * @param {*} model 登录信息
 */
const setLoginModel = (model) => {
  setLocalStorage('LOGINMODEL', model)
}

/**
 * 获取查询车次信息
 */
const getQueryInfo = () => {
  const data = getLocalStorage('QUERYINFO')

  return data
}

/**
 * 保存查询车次信息
 * @param {*} model 查询车次信息
 */
const setQueryInfo = (model) => {
  setLocalStorage('QUERYINFO', model)
}

/**
 * 设置localStorage
 * @param {*} name 名称
 * @param {*} value 值
 */
function setLocalStorage (name, value) {
  localStorage[name] = JSON.stringify(value)
}

/**
 * 获取localStorage
 * @param {*} name 名称
 */
function getLocalStorage (name) {
  const value = localStorage[name] || null
  const data = JSON.parse(value)

  return data
}

/**
 * 休眠
 * @param {*} time 时间（毫秒）
 */
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

/**
 * 任务
 */
// const task = {
//   startFunc: [],
//   /**
//    * 启动任务
//    * @param {*} index 任务索引号
//    */
//   start (index) {
//     this.stop(index)

//     let timeout = 1
//     const taskItem = Vue.store.getters.taskData[index]

//     this.startFunc[index] = setInterval(async () => {
//       this.setStatus(index, `${timeout}秒后，开始查询...`)

//       if (timeout <= 0) {
//         this.stop(index) // 暂停计时器
//         timeout = 1
//         // 开始查询
//         const {fromCityCode, toCityCode, trainDate} = taskItem.queryInfo

//         this.setStatus(index, '正在查询...')
//         const res = await Vue.api.base.getTicket(fromCityCode, toCityCode, trainDate)
//         let trainSeats = [] // 有票数的座位
//         // 检查匹配车次是否符合预订条件
//         let trainData = []

//         res.forEach(train => {
//           if (taskItem.trains.indexOf(train.trainCode) > -1) {
//             const arrPassenger = taskItem.passengers.passengerName.split(',')
//             const seatItems = this.isHasTicket(taskItem.seats, train.seatTypes, arrPassenger)
//             const arrSeat = trainSeats.concat(seatItems)

//             trainSeats = Array.from(new Set(arrSeat))

//             if (!seatItems.length) return

//             trainData.push(train)
//           }
//         })

//         // 如果没有符合预订条件的车次，则继续启动任务
//         if (!trainData.length) {
//           this.start(index)
//           return
//         }

//         // 开始准备提交订单
//         this.setStatus(index, '正在开始准备提交订单...')
//         notification.show('提示', {
//           body: `【任务${index}】正在执行提交订单`,
//           tag: 'order'
//         })
//         // this.startAutoSubmitOder(trainData, trainSeats, taskItem, index)
//         this.startSubmitOrder(trainData, trainSeats, taskItem, index)
//         return
//       }

//       timeout = parseFloat(timeout - 0.1).toFixed(1)
//     }, 100)
//   },
//   /**
//    * 暂停任务
//    * @param {*} index 任务索引号
//    */
//   stop (index) {
//     clearInterval(this.startFunc[index])
//   },
//   /**
//    * 检查是否有票
//    * @param {*} chkSeats 选择的座位
//    * @param {*} seatTypes 车次的座位
//    * @param {*} arrPassenger 乘客
//    */
//   isHasTicket (chkSeats, seatTypes, arrPassenger) {
//     let result = []
//     const passengerCount = arrPassenger.length

//     chkSeats.filter(s => {
//       const trainSeat = seatTypes.find(t => t.seatTypeCode === s)

//       if (!trainSeat) return

//       const ticketRemark = trainSeat.seatTypeDetail
//       let ticketCount = ticketRemark.match(/（(.+)）/)[1]

//       ticketCount = Number(ticketCount)

//       if ('有'.indexOf(ticketCount.toString()) > -1 || (ticketCount.toString() !== 'NaN' && ticketCount >= passengerCount)) {
//         result.push(s)
//       }
//     })

//     return result
//   },
//   /**
//    * 设置任务状态
//    * @param {*} index 任务索引号
//    * @param {*} text 状态内容
//    */
//   setStatus (index, text) {
//     const taskStatusInfo = {
//       index,
//       text
//     }

//     Vue.store.dispatch('setTaskDataStatus', taskStatusInfo)
//   },
//   /**
//    * 休眠
//    * @param {*} time 时间（毫秒）
//    */
//   sleep (time) {
//     return new Promise(resolve => setTimeout(resolve, time))
//   },
//   /**
//    * 开始提交订单（自动提交）
//    * @param {*} trainData 车次
//    * @param {*} trainSeats 座位
//    * @param {*} taskItem 任务项
//    * @param {*} index 任务索引号
//    */
//   async startAutoSubmitOder (trainData, trainSeats, taskItem, index) {
//     const queryInfo = taskItem.queryInfo
//     const passengers = taskItem.passengers
//     let isStop = false // 是否终止提交（当未登录）
//     let title = '提示'
//     let content = '哎呀！！！被挤下线了，请重新登录'

//     for (let train of trainData) {
//       if (isStop) return

//       for (let seatCode of trainSeats) {
//         const seatText = Vue.api.getSeatTypeInfo(seatCode)

//         // 提交订单
//         this.setStatus(index, `正在预订【${train.trainCode}】车次的【${seatText}】...`)
//         const orderResult = await this.autoSubmitOrder(train.secret, queryInfo, passengers, seatCode)

//         if (orderResult.code < 1) {
//           this.setStatus(index, `【${train.trainCode}】车次的【${seatText}】预订失败`)
//           Vue.alert(orderResult.message)

//           if (orderResult.message.indexOf('登录') > -1) {
//             this.setStatus(index, '您的登录状态已失效，请重新登录')
//             Vue.eventBus.$emit('openDialog', 'loginModal')
//             notification.show(title, {
//               body: content,
//               tag: 'order'
//             })

//             isStop = true
//             return
//           }
//           continue
//         }

//         // 获取订单排队信息
//         this.setStatus(index, `【${train.trainCode}】车次的【${seatText}】正在排队...`)
//         const queueResult = await this.getOrderQueueInfoAsync(train, queryInfo.trainDate, seatCode)

//         if (queueResult.code < 1) {
//           this.setStatus(index, `队伍太长，【${train.trainCode}】车次的【${seatText}】没能挤进去`)
//           Vue.alert(queueResult.message)

//           if (queueResult.message.indexOf('登录') > -1) {
//             this.setStatus(index, '您的登录状态已失效，请重新登录')
//             Vue.eventBus.$emit('openDialog', 'loginModal')
//             notification.show(title, {
//               body: content,
//               tag: 'order'
//             })

//             isStop = true
//             return
//           }
//           continue
//         }

//         const key = orderResult.ticketData[1]
//         const awaitTime = parseInt(orderResult.captchaCodeTime)

//         // 是否要验证码
//         if (orderResult.isCaptchaCode) {
//           // 将确认提交订单的数据存储到store
//           const orderData = {
//             train,
//             seatCode,
//             passengers,
//             key,
//             awaitTime,
//             index
//           }

//           Vue.store.dispatch('setConfirmOrderData', orderData)
//           content = `正在预订【${train.trainCode}】车次【${seatText}】，请选择验证码`
//           this.setStatus(index, `正在预订【${train.trainCode}】车次【${seatText}】，等待选择验证码...`)
//           Vue.eventBus.$emit('openDialog', 'captchCodeModal')
//           notification.show(title, {
//             body: content,
//             tag: 'order'
//           })

//           isStop = true
//           return
//         }

//         // 确认提交订单（不需要验证码）
//         const confirmResult = await this.confirmOrderQueueAsync(train, seatCode, passengers, key, '', index, awaitTime)

//         if (confirmResult.code < 1) {
//           if (confirmResult.code === 0) {
//             isStop = true
//             return
//           }
//           continue
//         }
//       }
//     }
//   },
//   /**
//    * 自动提交订单
//    * @param {*} trainSecret 车次凭证
//    * @param {*} queryInfo 查询信息
//    * @param {*} passengers 乘客信息
//    * @param {*} seatCode 座位代码
//    */
//   autoSubmitOrder (trainSecret, queryInfo, passengers, seatCode) {
//     const orderData = {
//       secretStr: decodeURIComponent(trainSecret),
//       train_date: queryInfo.trainDate,
//       query_from_station_name: queryInfo.fromCityName,
//       query_to_station_name: queryInfo.toCityName,
//       passengerTicketStr: passengers.passengerTickets.replace(/(seatcode)/gi, seatCode),
//       oldPassengerStr: passengers.oldPassengers
//     }

//     return Vue.api.autoSubmitOrder(orderData)
//   },

//   /**
//    * 订单排队信息（自动提交）
//    * @param {*} train 车次
//    * @param {*} trainDate 乘车日期
//    * @param {*} seatCode 座位代码
//    */
//   getOrderQueueInfoAsync (train, trainDate, seatCode) {
//     const currentDate = new Date()
//     const arrDate = trainDate.split('-')

//     currentDate.setFullYear(arrDate[0], arrDate[1] - 1, arrDate[2])

//     const queueData = {
//       train_date: currentDate.toString(),
//       train_no: train.trainNo,
//       stationTrainCode: train.trainCode,
//       seatType: seatCode,
//       fromStationTelecode: train.fromCityCode,
//       toStationTelecode: train.toCityCode,
//       leftTicket: train.ypInfo
//     }

//     return Vue.api.getOrderQueueInfoAsync(queueData)
//   },
//   /**
//    * 确认提交订单（自动提交）
//    * @param {*} train 车次
//    * @param {*} seatCode 座位代码
//    * @param {*} passengers 乘客
//    * @param {*} key key
//    * @param {*} captchCode 验证码
//    * @param {*} index 任务索引号
//    * @param {*} awaitTime 提交订单的等待时间
//    */
//   async confirmOrderQueueAsync (train, seatCode, passengers, key, captchCode, index, awaitTime) {
//     const seatText = Vue.api.getSeatTypeInfo(seatCode)
//     const passengerTicket = passengers.passengerTickets.replace(/(seatcode)/gi, seatCode)
//     const formData = {
//       passengerTicketStr: passengerTicket,
//       oldPassengerStr: passengers.oldPassengers,
//       randCode: captchCode,
//       purpose_codes: '',
//       key_check_isChange: key,
//       leftTicketStr: train.ypInfo,
//       train_location: train.locationCode,
//       choose_seats: '',
//       seatDetailType: ''
//     }

//     this.setStatus(index, `正在确认提交【${train.trainCode}】车次【${seatText}】...`)
//     // 由于12306提交订单的安全周期问题，需要等待一定时间
//     await this.sleep(awaitTime)

//     let res = await Vue.api.confirmOrderQueueAsync(formData)
//     let data = {}

//     if (res.code < 1) {
//       this.setStatus(index, `【${train.trainCode}】车次【${seatText}】预订失败...`)
//       Vue.alert(res.message)

//       if (res.message.indexOf('登录') > -1) {
//         this.setStatus(index, '您的登录状态已失效，请重新登录')
//         Vue.eventBus.$emit('openDialog', 'loginModal')
//         notification.show('提示', {
//           body: '哎呀！！！被挤下线了，请重新登录',
//           tag: 'order'
//         })

//         data.code = 0
//         return data
//       }

//       data.code = -1
//       return data
//     }

//     this.setStatus(index, `【${train.trainCode}】车次【${seatText}】等待出票...`)
//     // 获取订单出票时间
//     return this.getOrderAwaitTime(train, seatText, index)
//   },
//   /**
//    * 启动订单出票任务
//    */
//   startOrderAwaitFunc: null,
//   /**
//    * 停止订单出票时间任务
//    */
//   stopOrderAwaitFunc () {
//     clearInterval(this.startOrderAwaitFunc)
//   },
//   /**
//    * 获取订单出票时间
//    * @param {*} train 车次
//    * @param {*} seatText 座位
//    * @param {*} index 任务索引号
//    */
//   getOrderAwaitTime (train, seatText, index) {
//     return new Promise(resolve => {
//       let data = {}
//       let title = '提示'
//       let content = '哎呀！！！被挤下线了，请重新登录'

//       this.stopOrderAwaitFunc()

//       this.startOrderAwaitFunc = setInterval(async () => {
//         const res = await Vue.api.getOrderAwaitTime()

//         if (res.code < 1) {
//           Vue.alert(res.message)

//           if (res.message.indexOf('登录') > -1) {
//             this.stopOrderAwaitFunc()

//             this.setStatus(index, '您的登录状态已失效，请重新登录')
//             Vue.eventBus.$emit('openDialog', 'loginModal')
//             notification.show(title, {
//               body: content,
//               tag: 'order'
//             })

//             data.code = 0
//             resolve(data)
//           }

//           if (res.message.indexOf('出票超时') > -1) {
//             this.stopOrderAwaitFunc()

//             this.setStatus(index, `【${train.trainCode}】车次【${seatText}出票失败...`)
//             notification.show(title, {
//               body: `【${train.trainCode}】出票失败！原因：${res.message}`,
//               tag: 'order'
//             })

//             data.code = -2
//             resolve(data)
//           }

//           data.code = -1
//           resolve(data)
//         }

//         // 出票成功
//         if (res.orderId) {
//           const orderNo = res.orderId

//           title = 'WOW，恭喜您抢到票了～'
//           content = `您的订单号：【${orderNo}】，请在30分钟内完成支付`

//           this.stopOrderAwaitFunc()
//           speech.textToSpeech(`${title}您的订单号：【${orderNo.replace(/\s*/g, '|')}】，请在30分钟内完成支付`)
//           this.setStatus(index, `【${train.trainCode}】车次【${seatText}】出票成功...`)
//           Vue.swal({
//             title: title,
//             text: content,
//             icon: 'success',
//             button: '关闭'
//           })
//           notification.show(title, {
//             body: content
//           })

//           data.code = 1
//           data.orderId = orderNo
//           resolve(data)
//         }
//       }, 500)
//     })
//   },

//   /**
//    * 开始提交订单
//    * @param {*} trainData 车次
//    * @param {*} trainSeats 座位
//    * @param {*} taskItem 任务项
//    * @param {*} index 任务序号
//    */
//   async startSubmitOrder (trainData, trainSeats, taskItem, index) {
//     const queryInfo = taskItem.queryInfo
//     const passengers = taskItem.passengers
//     let isStop = false // 是否终止提交（当未登录）
//     let title = '提示'
//     let content = '哎呀！！！被挤下线了，请重新登录'

//     for (let train of trainData) {
//       if (isStop) return

//       for (let seatCode of trainSeats) {
//         const seatText = Vue.api.getSeatTypeInfo(seatCode)

//         // 提交订单
//         this.setStatus(index, `正在预订【${train.trainCode}】车次的【${seatText}】...`)
//         const orderResult = await this.submitOrder(train.secret, queryInfo)

//         if (orderResult.code < 1) {
//           this.setStatus(index, `【${train.trainCode}】车次的【${seatText}】预订失败`)
//           Vue.alert(orderResult.message)

//           continue
//         }

//         const orderResultData = orderResult.data

//         // 检查订单
//         this.setStatus(index, `【${train.trainCode}】车次的【${seatText}】正在检查订单信息...`)
//         const checkResult = await this.checkOrderInfo(passengers, orderResultData.orderToken, '', seatCode)

//         if (checkResult.code < 1) {
//           this.setStatus(index, `【${train.trainCode}】车次的【${seatText}无法提交订单`)
//           Vue.alert(checkResult.message)

//           if (checkResult.message.indexOf('登录') > -1) {
//             this.setStatus(index, '您的登录状态已失效，请重新登录')
//             Vue.eventBus.$emit('openDialog', 'loginModal')
//             notification.show(title, {
//               body: content,
//               tag: 'order'
//             })

//             isStop = true
//             return
//           }
//           continue
//         }

//         const awaitTime = parseInt(checkResult.captchaCodeTime)

//         // 是否要验证码
//         if (checkResult.isCaptchaCode) {
//           // 将确认提交订单的数据存储到store
//           const orderData = {
//             train,
//             seatCode,
//             passengers,
//             key: orderResultData.orderKey,
//             token: orderResultData.orderToken,
//             awaitTime,
//             index
//           }

//           Vue.store.dispatch('setConfirmOrderData', orderData)
//           content = `正在预订【${train.trainCode}】车次【${seatText}】，请选择验证码`
//           this.setStatus(index, `正在预订【${train.trainCode}】车次【${seatText}】，等待选择验证码...`)
//           Vue.eventBus.$emit('openDialog', 'captchCodeModal')
//           notification.show(title, {
//             body: content,
//             tag: 'order'
//           })

//           isStop = true
//           return
//         }

//         // 获取订单排队信息
//         this.setStatus(index, `【${train.trainCode}】车次的【${seatText}】正在排队...`)
//         const queueResult = await this.getOrderQueueInfo(train, queryInfo.trainDate, seatCode, orderResultData.orderToken)

//         if (queueResult.code < 1) {
//           this.setStatus(index, `队伍太长，【${train.trainCode}】车次的【${seatText}】没能挤进去`)
//           Vue.alert(queueResult.message)

//           if (queueResult.message.indexOf('登录') > -1) {
//             this.setStatus(index, '您的登录状态已失效，请重新登录')
//             Vue.eventBus.$emit('openDialog', 'loginModal')
//             notification.show(title, {
//               body: content,
//               tag: 'order'
//             })

//             isStop = true
//             return
//           }
//           continue
//         }

//         // 确认提交订单（不需要验证码）
//         const confirmResult = await this.confirmOrderQueue(train, passengers, orderResultData.orderKey, orderResultData.orderToken, seatCode, '', index, awaitTime)

//         if (confirmResult.code < 1) {
//           if (confirmResult.code === 0) {
//             isStop = true
//             return
//           }
//           continue
//         }
//       }
//     }
//   },
//   /**
//    * 提交订单
//    * @param {*} trainSecret 车次凭证
//    * @param {*} queryInfo 查询信息
//    */
//   submitOrder (trainSecret, queryInfo) {
//     const currentDate = new Date()
//     const formData = {
//       secretStr: decodeURIComponent(trainSecret),
//       train_date: queryInfo.trainDate,
//       back_train_date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)}-${currentDate.getDate()}`,
//       query_from_station_name: queryInfo.fromCityName,
//       query_to_station_name: queryInfo.toCityName
//     }

//     return Vue.api.submitOrder(formData)
//   },
//   /**
//    * 检查订单
//    * @param {*} passengers 乘客
//    * @param {*} token 订单token
//    * @param {*} captchCode 验证码
//    */
//   checkOrderInfo (passengers, token, captchCode, seatCode) {
//     const formData = {
//       passengerTicketStr: passengers.passengerTickets.replace(/(seatcode)/gi, seatCode),
//       oldPassengerStr: passengers.oldPassengers,
//       REPEAT_SUBMIT_TOKEN: token,
//       randCode: captchCode
//     }

//     return Vue.api.checkOrderInfo(formData)
//   },
//   /**
//    * 获取提交订单队列信息
//    * @param {*} train 车次
//    * @param {*} trainDate 乘车日期
//    * @param {*} seatCode 座位code
//    * @param {*} token token
//    */
//   getOrderQueueInfo (train, trainDate, seatCode, token) {
//     const currentDate = new Date()
//     const arrDate = trainDate.split('-')

//     currentDate.setFullYear(arrDate[0], arrDate[1] - 1, arrDate[2])

//     const formData = {
//       train_date: currentDate.toString(),
//       train_no: train.trainNo,
//       stationTrainCode: train.trainCode,
//       seatType: seatCode,
//       fromStationTelecode: train.fromCityCode,
//       toStationTelecode: train.toCityCode,
//       leftTicket: train.ypInfo,
//       train_location: train.locationCode,
//       REPEAT_SUBMIT_TOKEN: token
//     }
//     const seatText = Vue.api.getSeatTypeInfo(seatCode)

//     return Vue.api.getOrderQueueInfo(formData, seatText)
//   },
//   /**
//    * 确认提交订单
//    * @param {*} train 车次
//    * @param {*} passengers 乘客
//    * @param {*} key key
//    * @param {*} token token
//    * @param {*} seatCode 座位code
//    * @param {*} captchCode 验证码
//    * @param {*} index 任务索引号
//    * @param {*} awaitTime 提交订单的等待时间
//    */
//   async confirmOrderQueue (train, passengers, key, token, seatCode, captchCode, index, awaitTime) {
//     const seatText = Vue.api.getSeatTypeInfo(seatCode)
//     const formData = {
//       passengerTicketStr: passengers.passengerTickets.replace(/(seatcode)/gi, seatCode),
//       oldPassengerStr: passengers.oldPassengers,
//       randCode: captchCode,
//       key_check_isChange: key,
//       leftTicketStr: train.ypInfo,
//       train_location: train.locationCode,
//       choose_seats: '',
//       seatDetailType: '',
//       REPEAT_SUBMIT_TOKEN: token
//     }

//     this.setStatus(index, `正在确认提交【${train.trainCode}】车次【${seatText}】...`)
//     // 由于12306提交订单的安全周期问题，需要等待一定时间
//     await this.sleep(awaitTime)

//     let res = await Vue.api.confirmOrderQueue(formData)
//     let data = {}

//     if (res.code < 1) {
//       this.setStatus(index, `【${train.trainCode}】车次【${seatText}】预订失败...`)
//       Vue.alert(res.message)

//       if (res.message.indexOf('登录') > -1) {
//         this.setStatus(index, '您的登录状态已失效，请重新登录')
//         Vue.eventBus.$emit('openDialog', 'loginModal')
//         notification.show('提示', {
//           body: '哎呀！！！被挤下线了，请重新登录',
//           tag: 'order'
//         })

//         data.code = 0
//         return data
//       }

//       data.code = -1
//       return data
//     }

//     this.setStatus(index, `【${train.trainCode}】车次【${seatText}】等待出票...`)
//     // 获取订单出票时间
//     return this.getOrderAwaitTime(train, seatText, index)
//   }
// }

// console.log(task)

/**
 * 通知
 */
const notification = {
  notictice: null,
  /**
   * 显示通知
   * @param {*} title 通知标题
   * @param {*} option 通知配置
   */
  show (title, option) {
    title = title || '提示'
    option = Object.assign({
      body: '', // 通知内容
      icon: null || require('../assets/logo.png'), // 通知中显示的图标的URL
      // image: null || require('../assets/logo.png'), // 通知中显示的图像的URL
      data: null, // 通知关联的任务类型的数据
      requireInteraction: false, // 通知保持有效不自动关闭，默认为false
      tag: null, // 识别标签，相同tag时只会打开同一个通知窗口
      timeout: 3000 // 自动关闭时间
    }, option)

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // 允许
        this.notictice = new Notification(title, option)

        if (option.timeout > 0) {
          setTimeout(() => {
            this.notictice.close()
          }, option.timeout)
        }
      } else if (permission === 'denied') {
        // 拒绝
        Vue.alert('您拒绝了桌面通知')
      } else {
        Vue.alert('等待您允许桌面通知')
      }
    })
  },
  /**
   * 关闭通知
   */
  hide () {
    if (!this.notictice) return

    this.notictice.close()
  }
}

/**
 * 语音
 */
const speech = {
  /**
   * 文本转语音（语音合成）
   * @param {*} text 文本
   */
  textToSpeech (text) {
    const sayText = new window.SpeechSynthesisUtterance(text)

    window.speechSynthesis.speak(sayText)
  }
}

export default {
  getLoginModel,
  setLoginModel,
  getQueryInfo,
  setQueryInfo,
  sleep,
  notification,
  speech
}
