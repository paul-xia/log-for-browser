(function(factory) {
    let Config = Object.assign({
        fingerNum: 5,
        namespace: 'console'
    }, window.ConsoleLogConfig)
    let console = window.console
    let diffAssert = console.assert
    let diffCount = console.count
    let diffDebug = console.debug
    let diffDir = console.dir
    let diffError = console.error
    let diffLog = console.log
    let diffTable = console.table
    let diffTime = console.time
    let diffTimeEnd = console.timeEnd
    let diffWarn = console.warn

    let diffXMLHttpRequest = XMLHttpRequest

    let consoleNodeWrapper = domCreater(Config.namespace +'-wrapper')
    let consoleMask = domCreater(Config.namespace +'-mask')
    let consolePlugWrap = domCreater(Config.namespace +'-plug-wrap')
    let consoleItemWrap = domCreater(`${Config.namespace}-items ${Config.namespace}-items-wrap`)
    let consoleNetworkWrap = domCreater(`${Config.namespace}-networks ${Config.namespace}-items-wrap`)
    let consoleLocalstorageWrap = domCreater(`${Config.namespace}-localstorage ${Config.namespace}-items-wrap`)
    let consoleSessionStorageWrap = domCreater(`${Config.namespace}-sessionstorage ${Config.namespace}-items-wrap`)
    let consoleCookieWrap = domCreater(`${Config.namespace}-cookies ${Config.namespace}-items-wrap`)
    let consoleTabBar = domCreater(Config.namespace +'-tab-bar')
    let consoleInputWrap = domCreater(Config.namespace +'-input-wrap')
    let styleText = `
        .${Config.namespace}-wrapper{ position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999999; font-family: 'Source Sans Pro', 'Lucida Grande', sans-serif; font-size: 12px;}
        .${Config.namespace}-mask{position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #000; opacity: 0.3;}
        .${Config.namespace}-plug-wrap{position: absolute; z-index: 2; bottom: 0; left: 0; right: 0; background-color: #fff; }
        .${Config.namespace}-items-wrap{ max-height: 20em; min-height: 5em; overflow: hidden;  overflow-y: auto; -webkit-overflow-scrolling : touch; }
        .${Config.namespace}-item{border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; margin-bottom: -1px; word-break: break-all;}
        .${Config.namespace}-date{color: #0089ff;}
        .${Config.namespace}-type-error{ color: red; background-color: #fff0f0; border-top-color: #fed7d8; border-bottom-color: #fed7d8; position: relative; z-index: 1;}
        .${Config.namespace}-inline{padding-right: 0.5em;}
        .${Config.namespace}-number{ color: rgb(29, 14, 204); }
        .${Config.namespace}-table-wrap{padding: 5px;}
        .${Config.namespace}-table{ width: 100%; background-color: #fff; border:1px solid #aaa; text-align: left; border-collapse: collapse; border-spacing: 0;}
        .${Config.namespace}-th{background-color: #f3f3f3; font-weight: normal;}
        .${Config.namespace}-tr:nth-child(2n+1){background-color: #f2f7fd;}
        .${Config.namespace}-th, .${Config.namespace}-td, .${Config.namespace}-tr{border: 1px solid #aaa; border-spacing:0}
        .${Config.namespace}-type-warn{ background-color: #fffbe7; border-top-color: #fff5c4; border-bottom-color: #fff5c4; color: #5b3a07; position: relative; z-index: 1;}
        .${Config.namespace}-tab-bar{ line-height: 25px; background-color: #f3f3f3; border-bottom: 1px solid #b6b4b6; border-top: 1px solid #b6b4b6;}
        .${Config.namespace}-tab{display: inline-block; padding: 0 4px; border-bottom: 1px solid #b6b4b6; margin-bottom: -1px; position: relative;}
        .${Config.namespace}-tab:after{content: ' '; position: absolute; right: 0; height: 50%; width: 1px; background-color: #dcdcdc; top: 50%; transform: translate(0, -50%); -webkit-transform: translate(0, -50%);}
        .${Config.namespace}-tab-current{border-bottom-color: #9abcf3; position: relative; z-index: 1; background-color: #e5e5e5;}
        .${Config.namespace}-input-wrap{ position: relative; font-size: 0; border-top: 1px solid #b6b4b6;}
        .${Config.namespace}-pre-code{ position: absolute; left: 0; top: 50%; transform: translate(0, -50%); -webkit-transform: translate(0, -50%); font-size: 12px;}
        .${Config.namespace}-text-input{border:0 none; width: 100%; padding-left: 1em; font-size: 12px;}
    `
    let styleEle = domCreater('console-style', 'style')

    let Cookie = {
        get:function(key){
            let getCookie = document.cookie.replace(/[ ]/g, '')
            if(!getCookie) {
                if(key) return ''
                return {}
            }
            let arrCookie = getCookie.split(';')
            let cookieObj = {}
            for(let i = 0; i < arrCookie.length; i++){
                let arr = arrCookie[i].split('=')
                cookieObj[arr[0]] = arr[1]
            }
            if(key) return cookieObj[k]
            return cookieObj
        },
        delete:function(key){
            let date = new Date()
            date.setTime(date.getTime()-10000)
            document.cookie = key + '=v; expires =' + date.toGMTString()
            return key
        }
    }

    styleEle.innerHTML = styleText
    document.head.appendChild(styleEle)

    consoleNodeWrapper.style.display = 'none'

    consoleNodeWrapper.appendChild(consoleMask)
    consolePlugWrap.appendChild(consoleTabBar)
    consolePlugWrap.appendChild(consoleItemWrap)
    consolePlugWrap.appendChild(consoleNetworkWrap)
    consolePlugWrap.appendChild(consoleLocalstorageWrap)
    consolePlugWrap.appendChild(consoleSessionStorageWrap)
    consolePlugWrap.appendChild(consoleCookieWrap)
    consolePlugWrap.appendChild(consoleInputWrap)
    consoleNodeWrapper.appendChild(consolePlugWrap)
    document.body.appendChild(consoleNodeWrapper)

    consoleNetworkWrap.style.display = 'none'
    consoleLocalstorageWrap.style.display = 'none'
    consoleSessionStorageWrap.style.display = 'none'
    consoleCookieWrap.style.display = 'none'

    consoleTabBar.innerHTML = `<span class="${Config.namespace}-tab ${Config.namespace}-tab-current">Console</span><span class="${Config.namespace}-tab">Network</span><span class="${Config.namespace}-tab">Localstorage</span><span class="${Config.namespace}-tab">Sessionstorage</span><span class="${Config.namespace}-tab">Cookies</span>`
    consoleInputWrap.innerHTML = `<svg class="${Config.namespace}-pre-code" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1292"><path d="M329.525 191.547l56.285-58.261 393.996 392.021-393.996 392.021-56.285-58.261 331.786-333.761z" fill="#333333" p-id="1293"></path></svg><input class="${Config.namespace}-text-input">`

    consoleTabBar.addEventListener('click', e=>{
        consoleTabBar.querySelector(`.${Config.namespace}-tab-current`).className = `${Config.namespace}-tab`
        let text = e.target.innerText
        e.target.className = `${Config.namespace}-tab ${Config.namespace}-tab-current`
        consoleNodeWrapper.querySelectorAll(`.${Config.namespace}-items-wrap`).forEach(node=>{
            node.style.display = 'none'
        })
        consoleInputWrap.style.display = 'none'
        if(text === 'Console') {
            consoleItemWrap.style.display = 'block'
            consoleItemWrap.scrollTop = 999999
            consoleInputWrap.style.display = 'block'
        } else if(text === 'Network'){
            consoleNetworkWrap.style.display = 'block'
            consoleNetworkWrap.scrollTop = 999999
        } else if(text === 'Localstorage') {
            consoleLocalstorageWrap.innerHTML = ''
            consoleLocalstorageWrap.style.display = 'block'
            tableCreater(localStorage, consoleLocalstorageWrap, function(tr, trele){
                localStorage.removeItem(tr[0])
                trele.remove()
            })
            consoleLocalstorageWrap.scrollTop = 999999
        } else if(text === 'Sessionstorage') {
            consoleSessionStorageWrap.innerHTML = ''
            consoleSessionStorageWrap.style.display = 'block'
            tableCreater(sessionStorage, consoleSessionStorageWrap, function(tr, trele){
                sessionStorage.removeItem(tr[0])
                trele.remove()
            })
            consoleSessionStorageWrap.scrollTop = 999999
        } else if(text === 'Cookies') {
            consoleCookieWrap.innerHTML = ''
            consoleCookieWrap.style.display = 'block'
            tableCreater(Cookie.get(), consoleCookieWrap, function(tr, trele){
                Cookie.delete(tr[0])
                trele.remove()
            })
            consoleCookieWrap.scrollTop = 999999
        }
    }, false)

    document.addEventListener('touchstart', e=>{
        if(e.touches.length === Config.fingerNum) {
            consoleNodeWrapper.style.display = 'block'
            consoleItemWrap.scrollTop = 999999
            consoleNetworkWrap.scrollTop = 999999
        }
    }, false)

    consoleMask.addEventListener('touchend', e=>{
        consoleNodeWrapper.style.display = 'none'
    }, false)
    let input = consoleInputWrap.querySelector('input')
    input.addEventListener('keydown', e=>{
        if(e.keyCode !== 13 || input.value === '') return
        let text = input.value
        try{
            let fun = new Function('console.log("'+text+'"), console.log('+text+')')
            fun()
        } catch(err) {
            console.error(text + '\n' + err.message + '\n' + err.stack)
        }
        input.value = ''
    }, false)

    console.assert = function(assert, args){
        if(!assert) {
            consoleItemCreater.apply({
                classType: 'error'
            }, ['Assertion failed: ' + args])
        }
        diffAssert(assert, args)
    }

    let consoleStorageCounts = {}
    console.count = function(arg){
        if(!arg) arg = 'defaultCount'
        consoleStorageCounts[arg] = consoleStorageCounts[arg] || 0
        consoleStorageCounts[arg] ++
        consoleItemCreater.apply({}, [arg + ': ' + consoleStorageCounts[arg]])
        diffCount()
    }
    console.countStop = function(arg){
        if(!arg) arg = 'default'
        consoleStorageCounts[arg] = 0
    }
    console.log = function(){
        let args = Array.prototype.slice.call(arguments)
        consoleItemCreater.apply({}, args)
        diffLog.apply(window, arguments)
    }

    console.error = function(){
        let args = Array.prototype.slice.call(arguments)
        consoleItemCreater.apply({classType: 'error'}, args)
        diffError.apply(window, arguments)
    }

    console.table = function(obj){
        tableCreater(obj, consoleItemWrap)
        diffTable.apply(window, arguments)
    }

    console.warn = function(){
        let args = Array.prototype.slice.call(arguments)
        consoleItemCreater.apply({classType: 'warn'}, args)
        diffWarn.apply(window, arguments)
    }

    let consoleStorageTime = {}
    console.time = function(timeMark){
        timeMark = timeMark || 'default'
        if(consoleStorageTime[timeMark]) {
            consoleItemCreater.apply({}, [timeMark + ': ' + consoleStorageCounts[arg]])
        }

        consoleStorageTime[timeMark] = performance.now()
        diffTime(timeMark)
    }

    console.timeEnd = function(timeMark){
        timeMark = timeMark || 'default'
        let date = performance.now()
        if(consoleStorageTime[timeMark]) {
            consoleItemCreater.apply({}, [timeMark + ': ' + (date - consoleStorageTime[timeMark]) + 'ms'])
        }
        diffTimeEnd(timeMark)
    }

    factory.XMLHttpRequest = function(){

        let request = new diffXMLHttpRequest()
        let XMLHttpRequestOpen = request.__proto__.open
        let XMLHttpRequestSend = request.__proto__.send
        let reqArg = []
        request.open = function(){
            reqArg = arguments
            XMLHttpRequestOpen.apply(request, arguments)
        }
        request.send = function(){
            XMLHttpRequestSend.apply(request, arguments)
        }
        request.addEventListener('readystatechange', ()=>{
            if(request.readyState !== 4) return
            if (request.status >= 200 && request.status < 300) {
                consoleNetworkCreater.apply({}, [reqArg[0], reqArg[1], request.responseText])
            } else {
                consoleNetworkCreater.apply({classType: 'error'}, [reqArg[0], reqArg[1], request.status === 0 ? '网络错误' : '未知错误'])
            }
        })
        return request
    }

    factory.console = console

    function isArray(obj) { 
        return Object.prototype.toString.call(obj) === '[object Array]'
    }

    function isObject(obj) { 
        return Object.prototype.toString.call(obj) === '[object Object]'
    }  

    function tableCreater(obj, tableWrap, showClearCall){
        let consoleItem = domCreater(`${Config.namespace}-item ${Config.namespace}-table-wrap`, 'div')
        let head = ['(key)']
        let trs = []
        if(typeof obj !== 'object') return diffLog(obj)
        if(isArray(obj)) {
            obj.map((item, index)=>{
                let tr = []
                if(isObject(item)) {
                    let keys = Object.keys(item)
                    tr.push(index)
                    keys.map(k=>{
                        let index = head.indexOf(k)
                        let lm = item[k]
                        let value
                        if(isObject(lm)) {
                            value = JSON.stringify(lm)
                        } else if(typeof lm === ' function') {
                            value = lm.toString()
                        } else {
                            value = lm
                        }
                        if(index === -1) {
                            head.push(k)
                            tr.push(value)
                        } else {
                            let time = index - (tr.length - 1)
                            for(let i = 0; i < time; i ++) {
                                tr.push('')
                            }
                            tr.push(value)
                        }
                    })
                }  else if(typeof item === 'number' || typeof item === 'string') {
                    tr.push(item)
                } else if(typeof item === 'function') {
                    tr.push(item.toString())
                }
                trs.push(tr)
            })
        } else {
            let keys = Object.keys(obj)
            head.push('(value)')
            keys.map(k=>{
                let item = obj[k]
                let tr = []
                tr.push(k)
                if(typeof item === 'object') {
                    tr.push('')
                    let itemKeys = Object.keys(item)
                    itemKeys.map(ok=>{
                        let index = head.indexOf(ok)
                        let value = typeof item[ok] === 'object' ? JSON.stringify(item[ok]) : item[ok]
                        if(index === -1) {
                            head.push(ok)
                            tr.push(value)
                        } else {
                            let time = index - (tr.length - 1) - 1
                            for(let i = 0; i < time; i ++) {
                                tr.push('')
                            }
                            tr.push(value)
                        }
                    })
                } else if(typeof item === 'number' || typeof item === 'string') {
                    tr.push(item)
                } else if(typeof item === 'function') {
                    tr.push(item.toString())
                }

                trs.push(tr)
            })
        }

        if(showClearCall) head.push('(ctrl)')
        let table = domCreater(`${Config.namespace}-table`, 'table')
        let thead = domCreater(`${Config.namespace}-thead`, 'thead')
        head.map(th=>{
            let thEle = domCreater(`${Config.namespace}-th`, 'th')
            thEle.innerText = th
            thead.appendChild(thEle)
        })
        table.appendChild(thead)
        trs.map(tr=>{
            let trEle = domCreater(`${Config.namespace}-tr`, 'tr')
            for(let i = 0; i < head.length; i ++) {
                let tdEle = domCreater(`${Config.namespace}-td`, 'td')
                let td = tr[i] !== undefined ? tr[i] : ''
                tdEle.innerText = td
                if(showClearCall && i === head.length - 1) {
                    tdEle.innerText = '清除'
                    tdEle.style.textAlign = 'center'
                    tdEle.addEventListener('click', e=>{
                        showClearCall(tr, trEle)
                    }, false)
                }
                trEle.appendChild(tdEle)
            }
            table.appendChild(trEle)
        })
        consoleItem.appendChild(table)
        tableWrap.appendChild(consoleItem)
    }

    function domCreater(className, tag){
        tag = tag || 'div'
        let ele = document.createElement(tag)
        ele.className = className
        return ele
    }

    function getTimeString(){
        let date = new Date()
        let h = date.getHours()
        let m = date.getMinutes()
        let s = date.getSeconds()
        let ms = date.getMilliseconds()
        h = h < 10 ? '0' + h : h
        m = m < 10 ? '0' + m : m
        s = s < 10 ? '0' + s : s
        ms = ms < 10 ? '0' + ms : ms
        return `${h}:${m}:${s}:${ms}`
    }

    function consoleNetworkCreater(){
        let itemClass = [`${Config.namespace}-item`]
        let type = this.classType
        if(type) itemClass.push(`${Config.namespace}-type-${type}`)
        let consoleItem = domCreater(itemClass.join(' '))
        let args = Array.prototype.slice.call(arguments)
        let dateEle = domCreater(`${Config.namespace}-inline ${Config.namespace}-date`, 'span')
        dateEle.innerText = getTimeString()
        consoleItem.appendChild(dateEle)
        args.map(im=>{
            let ele
            if(typeof im === 'number') {
                ele = domCreater(`${Config.namespace}-inline ${Config.namespace}-number`, 'span')
                ele.innerText = im
            } else if(typeof im === 'object') {
                ele = domCreater(`${Config.namespace}-inline ${Config.namespace}-object`, 'span')
                if(im === window) {
                    ele.innerText = 'window object'
                } else {
                    ele.innerText = JSON.stringify(im)
                }
            } else {
                ele = domCreater(`${Config.namespace}-inline ${Config.namespace}-other`, 'span')
                ele.innerText = im
            }
            consoleItem.appendChild(ele)
        })
        consoleNetworkWrap.appendChild(consoleItem)
        consoleNetworkWrap.scrollTop = 999999
    }

    function consoleItemCreater(){
        let itemClass = [`${Config.namespace}-item`]
        let type = this.classType
        if(type) itemClass.push(`${Config.namespace}-type-${type}`)
        let consoleItem = domCreater(itemClass.join(' '))
        let args = Array.prototype.slice.call(arguments)
        let dateEle = domCreater(`${Config.namespace}-inline ${Config.namespace}-date`, 'span')
        dateEle.innerText = getTimeString()
        consoleItem.appendChild(dateEle)
        args.map(im=>{
            let ele
            if(typeof im === 'number') {
                ele = domCreater(`${Config.namespace}-inline ${Config.namespace}-number`, 'span')
                ele.innerText = im
            } else if(typeof im === 'object') {
                ele = domCreater(`${Config.namespace}-inline ${Config.namespace}-object`, 'span')
                if(im === window) {
                    ele.innerText = 'window object'
                } else {
                    ele.innerText = JSON.stringify(im)
                }
            } else {
                ele = domCreater(`${Config.namespace}-inline ${Config.namespace}-other`, 'span')
                ele.innerText = im
            }
            consoleItem.appendChild(ele)
        })
        consoleItemWrap.appendChild(consoleItem)
        consoleItemWrap.scrollTop = 999999
    }
})((function() {
  if ( typeof module !== 'undefined') return module.exports;
  return window;
})())