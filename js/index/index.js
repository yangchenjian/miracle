
$(function () {

  function dataType(data) {
    return Object.prototype.toString.call(data)
  }

  // 顶部导航栏的三个栏目的切换 其中第二个栏目需要发送ajax请求出相应页面的json接着渲染成html
  $('.nav-bar').on('click', 'ol.nav-items>li', function(e) {
    let $li = $(e.currentTarget).addClass('active')
    let index = $li.index()
    $li.siblings().removeClass('active')
    // 当$li被点击的时候 就触发自定义事件 自定义的事件名称 「tab-change」 传入index的参数 目的:解耦
    $li.trigger('tab-change',index)
    // 内容页面对应上栏目页面，index的下标是相通的
    $('.tab-contents>li').eq(index).addClass('active').siblings().removeClass('active')

  });
  /*
     监听自定义的「tab-change」事件，接受传入的index参数 
     因为是ajax请求页面，所以渲染过一次的页面就不用再请求了，节省资源 
     在dom上添加相应的标识 data-downloaded = 'yes',不要用true、false容易误判
  */ 
  $('.nav-bar').on('tab-change',function (e,index) {
    let $li = $('.tab-contents>li').eq(index)
    // 通过自定义属性值来确认 是否加载过 如果都加载过了 就不在继续加载了
    if ($li.attr('data-downloaded')==='yes') { return }
    // 没加载，那就加载吧
    if( index === 1 ){
      $.get('../../js/index/index-page2.json').then((res)=>{
        // 请求成功 添加上自己的「渲染成功」标识，防止多次加载
        $li.attr('data-downloaded','yes')
        $li.text(res.content)
      })
    }
    if (index === 2) {
      //做搜索页面的截流 就不请求页面了 直接写好页面内容
      return  
      $.get('../../js/index/index-page3.json').then((res)=>{
        $li.attr('data-downloaded','yes')
        $li.text(res.content)
      })
    }
  })
  

function searchMusic(keyword) {
    return new Promise((resolve,reject)=>{
      $.ajax({
        url: '../../song-source/songs-db.json',
        dataType: 'json',
      })
      .done(function(resTxt) {
         let res = resTxt.filter((item)=> {
          return item.name.indexOf(keyword)>=0
         })
         setTimeout(()=>{resolve(res)},(Math.random()*400+600))
      })
      .fail(function(textStatus,errorThrown) {
        console.log("错误类型: "+textStatus);
        console.log("异常详情: "+errorThrown);
      })   
    })
  }
// 节流思路 
/*
防抖 
要解决的问题：  防止空结果覆盖正确的结果，因为请求回来的时间是随机的所以会有这种风险存在
布置「防抖」的思路 用户输入时设定一个定时器去等用户，时间自己定，等时间到了，再去发请求 line95

*/ 

// 定义一个空闹钟
 let timer = undefined
 $('.search-input').on('input',(e)=>{
  let $thisInput = $(e.currentTarget)
  // 别忘了trim() 一下
  let $value = $thisInput.val().trim()
  // 数值为空 直接return 不做任何操作
  if ($value === '') { return }
  /*
    判断一下闹钟是不是 undefined 如果不是undefined，这证明客户依然在输入 记得砸烂防止发送失控的请求 接着再等600毫秒
  */ 
  if (timer) {
    //砸烂闹钟 重新设定一个
    clearTimeout(timer)
  }

  //在这个位置设定防抖定时器 这个定时器 延时600毫秒，然后再发出搜索的请求
  timer = setTimeout(function (argument) {
    searchMusic($value).then((res)=>{
    // 用户的val已经输入完毕啦，记得清空闹钟 等待下一次的闹钟设定
    timer = undefined
    if (res.length !== 0) {
      // res是个对象，主要拿它的name 别带花括号
      $('.output').text(res.map((r)=>r.name).join(','))
    }else{
       $('.output').text('非常抱歉没有结果!')
    } 
  })
  }, 600)

 })

  
 // window.searchMusic = searchMusic
// 获取首页音乐列表
  $.get('../../song-source/index-songs.json').then(function (response) {
   let items = response
   items.forEach((i)=>{
    let $li = $(
      `
         <li>
                <a href="./song.html?id=${i.id}">
                <h4>${i.name}</h4>
                <p>
                  ${i.singer}-${i.album}
                </p>
                  <svg class=" latest-play-icon" aria-hidden="true">
                    <use xlink:href="#icon-bofang"></use>
                  </svg>
                </a>
            </li>
      `)
     $('#latestMusic-list').append($li)
     // append完了之后，就可以吧加载图标去掉了
     $('.load-wrap').remove()
   })
  },function () {
    console.log('请求数据失败，检查数据格式')
  })

// 获取热歌榜音乐列表





})