(function(factory) {
    let ConsoleLogConfig = {
        fingerNum: window.ConsoleLogConfig ? window.ConsoleLogConfig.fingerNum : 5
    }
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

    let consoleNodeWrapper = domCreater('console-wrapper')
    let consoleMask = domCreater('console-mask')
    let consolePlugWrap = domCreater('console-plug-wrap')
    let consoleItemWrap = domCreater('console-items console-items-wrap')
    let consoleNetworkWrap = domCreater('console-networks console-items-wrap')
    let consoleLocalstorageWrap = domCreater('console-localstorage console-items-wrap')
    let consoleSessionStorageWrap = domCreater('console-sessionstorage console-items-wrap')
    let consoleCookieWrap = domCreater('console-cookies console-items-wrap')
    let consoleTabBar = domCreater('console-tab-bar')
    let consoleInputWrap = domCreater('console-input-wrap')

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

    consoleTabBar.innerHTML = '<span class="console-tab console-tab-current">Console</span><span class="console-tab">Network</span><span class="console-tab">Localstorage</span><span class="console-tab">Sessionstorage</span><span class="console-tab">Cookies</span>'
    consoleInputWrap.innerHTML = '<svg class="console-pre-code" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1292"><path d="M329.525 191.547l56.285-58.261 393.996 392.021-393.996 392.021-56.285-58.261 331.786-333.761z" fill="#333333" p-id="1293"></path></svg><input class="console-text-input">'

    consoleTabBar.addEventListener('click', e=>{
        consoleTabBar.querySelector('.console-tab-current').className = 'console-tab'
        let text = e.target.innerText
        e.target.className = 'console-tab console-tab-current'
        consoleNodeWrapper.querySelectorAll('.console-items-wrap').forEach(node=>{
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
        if(e.touches.length === ConsoleLogConfig.fingerNum) {
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
        let consoleItem = domCreater('console-item console-table-wrap', 'div')
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
        let table = domCreater('console-table', 'table')
        let thead = domCreater('console-thead', 'thead')
        head.map(th=>{
            let thEle = domCreater('console-th', 'th')
            thEle.innerText = th
            thead.appendChild(thEle)
        })
        table.appendChild(thead)
        trs.map(tr=>{
            let trEle = domCreater('console-tr', 'tr')
            for(let i = 0; i < head.length; i ++) {
                let tdEle = domCreater('console-td', 'td')
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
        let itemClass = ['console-item']
        let type = this.classType
        if(type) itemClass.push('console-type-' + type)
        let consoleItem = domCreater(itemClass.join(' '))
        let args = Array.prototype.slice.call(arguments)
        let dateEle = domCreater('console-inline console-date', 'span')
        dateEle.innerText = getTimeString()
        consoleItem.appendChild(dateEle)
        args.map(im=>{
            let ele
            if(typeof im === 'number') {
                ele = domCreater('console-inline console-number', 'span')
                ele.innerText = im
            } else if(typeof im === 'object') {
                ele = domCreater('console-inline console-object', 'span')
                if(im === window) {
                    ele.innerText = 'window object'
                } else {
                    ele.innerText = JSON.stringify(im)
                }
            } else {
                ele = domCreater('console-inline console-other', 'span')
                ele.innerText = im
            }
            consoleItem.appendChild(ele)
        })
        consoleNetworkWrap.appendChild(consoleItem)
        consoleNetworkWrap.scrollTop = 999999
    }

    function consoleItemCreater(){
        let itemClass = ['console-item']
        let type = this.classType
        if(type) itemClass.push('console-type-' + type)
        let consoleItem = domCreater(itemClass.join(' '))
        let args = Array.prototype.slice.call(arguments)
        let dateEle = domCreater('console-inline console-date', 'span')
        dateEle.innerText = getTimeString()
        consoleItem.appendChild(dateEle)
        args.map(im=>{
            let ele
            if(typeof im === 'number') {
                ele = domCreater('console-inline console-number', 'span')
                ele.innerText = im
            } else if(typeof im === 'object') {
                ele = domCreater('console-inline console-object', 'span')
                if(im === window) {
                    ele.innerText = 'window object'
                } else {
                    ele.innerText = JSON.stringify(im)
                }
            } else {
                ele = domCreater('console-inline console-other', 'span')
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