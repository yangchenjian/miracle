$(function () {

 /*

 NO.10 , 39.11
 NO.11 , 1.39-04.12  animation-play-state 这个属性来对付胶片转盘

通过主页的url的ID参数来判断给用户播放对应的音乐 location.search() 可以拿到 ?id=xxx 然后用正则拿到id后面的数值

发ajax给songs.json 把音乐数据拿到手
 */ 

 // let idUrl = location.search.matches(/\bid=([^&]*)/)[1]

/* 
把播放页面改成动态的
1- 首先就要拿到用户点击的歌曲链接的id
2-

 */
 // 拿到用户点击歌曲的id 记得数据类型的转换
let idUrl = parseInt(location.search.match(/\bid=([^&]*)/)[1], 10) 

// $.get('../../song-source/index-songs.json', function(res) {
//   let songsData = res
//   console.log(songsData)
// },function () {
//   console.log('他娘的，数据请求出错了！')
// });

$.get('../../song-source/index-songs.json').then(function (response) {
  let songsData = response
  // 把id符合的音乐所有的信息筛选出来 可以用箭头函数 不带花括号、小括号可以自动return  
  // id是唯一的所以筛选出来以后直接选下标为0的数据就可以，破掉数组状态把数据拿来用
  let song =  songsData.filter(s=>s.id === idUrl)[0]

  // let url = song.url  拿到歌曲的url
  // 把歌曲的链接，歌词，名字，图片拿过来
  let {url,lyric,name,coverPic} = song
  initPlayer.call(undefined,url)
  initText.call(undefined,lyric,name)
  initPic.call(undefined,coverPic)
},function () {
  console.log('请求出错！')
})



function initPlayer(url) {
  // 播放、暂停、获取播放时间 这三点很重要 只能用 createElement 来创建audio标签 别的招儿都不好使
  let audio = document.createElement('audio')
  audio.src = url
  // 能播放就播放
  audio.oncanplay = function () {
    // audio.play()
    // $('.disc-container .disc').addClass('playing')
  }
  //点击暂停就得暂停
  // 放置两个按钮，通过添加「类」来完成 显隐  后期操作比较好 所有判断依赖于这一个 「类」
  $('.icon-pause').on('click', function() {
      audio.pause()
    $('.disc-container .disc').removeClass('playing')    
  });
  $('.icon-play').on('click',function () {
      audio.play()
    $('.disc-container .disc').addClass('playing')    
  })

  /* 
   让歌词滚动要思考的问题
   1- 歌曲播放的时间  播放器的自带api currentTime   14.00
   2- 滚动方式 27.44
   3- 高亮歌词 32.53
   注意的是要放到 1- initPlayer的方法中去 2- 多用箭头函数 
  */

  setInterval(()=>{
    // 通过自带的API拿到指定时间，同时对拿到的时间进行处理，处理成p标签的data-time的样式（分+秒）方便进行比对
    // 获取整数的小技巧 ~~ 可以用来取反来获得整数 这样就得到分钟数了
    // 一个小数 取反两遍整数部分得以保留，小数部分被抛弃
    let seconds = audio.currentTime
    let munites = ~~( seconds / 60)
    let over = seconds- munites*60
    // 通过pad方法 歌词的时间格式搞定
    let resTime = `${pad(munites)}:${pad(over)}`
    // 遍历P元素拿到 data-time   注意$lines[i]是一个dom的元素,dom是没有attr这个属性的 需要加个eq
    let $lines =  $('.lyric-wrap .lines>p')
    // $whichLine 的放置位置要注意 要放在for循环外面
    let $whichLine
    for( let i = 0;i<$lines.length;i++ ){
      let $currentTimeline = $lines.eq(i).attr('data-time')
      let $nextTimeline = $lines.eq(i+1).attr('data-time')
      // 对这个判断要细化一下 主要是 最后一行歌词的处理 
      if( $lines.eq(i+1).length !== 0 && $currentTimeline<resTime && $nextTimeline>resTime){
        // $whichLine = $lines[i] 这是直接取到了 dom结构 不好使
        $whichLine = $lines.eq(i)
        break
      } 
    } 
    // 如果有 $whichLine 在进行后面的动作 主要是把对应的歌词滚动到那3行可以显示的区域里面去 
    // 对应歌词距离lines顶部的垂直高度 算高度差
    if($whichLine){
      // 添加歌词高亮
      $whichLine.addClass('active').prev().removeClass('active')
      let delta = $whichLine.offset().top - $('.lyric-wrap .lines').offset().top - $('.lyric-wrap').height()/3
      // 把对应的歌词显示在小区块里面  之前 - 号后面跟了一个空格 这是错误的！ 不能有空格 
      $('.lyric-wrap .lines').css('transform',`translateY(-${delta}px)`) 
    }
  }, 350)

    // 将时间处理成data-time一样的样式 走一个三目运算 目的解决歌词的时间问题
    function pad(num) {
      return num>=10?num + '' : '0'+num
    }
} //initPlayer end

// 初始化标题以及歌词
function initText(lyric,name) {
  $('.song-description>h2').text(name)
  let lyr = lyric
  let lyrArr = lyr.split('\n')
  let reg = /^\[(.+)\](.*)/
    lyrArr = lyrArr.map(function(item) {
      // let matches = reg.exec(item) exec有滞留问题 
      let matches = item.match(reg)
      if (matches) {
        return {
          time: matches[1],
          words: matches[2],
        }
      }
    })
    let $lyric = $('.lyric-wrap .lines')
    lyrArr.map(function (obj) {
      if (obj) {
        let node = `<p data-time="${obj.time}">${obj.words}</p>`
        // 开始使用appendto 后来报错 更正为append 才将生成的节点插入成功
        $lyric.append(node)
      }

    })
}

function initPic(imgsrc) {
  $('.disc-container .disc .cover').attr('src',imgsrc)
  $('.page').css({
    'background-image': `url(${imgsrc})` ,
  });
  // body...
}



})