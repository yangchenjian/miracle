$(document).ready(function(){
 //获取图片列表容器
  var imgCt = $('.carousel-ct')
 //获取每个放图片的li
  var imgLi = $('.carousel-ct>li')
 //获取每个图片的宽度
  var imgWidth = imgLi.width()
  //获取li的数量   之前写成了 imgLi.length()是错误的
  var imgTotal = imgLi.length
  //获取"上一张"的按钮节点
  var preBtn = $('.carousel .pre')
  //获取" 下一张 " 的元素按钮节点
  var nextBtn = $('.carousel .next')
  //获取子弹
  var bulletLi = $('.bullet>li')
  //动画状态锁
  var animateLock = false

  //first() 与 last() 方法 都是很重要的元素选取方法 要牢记  复制节点就 clone()
  // var lastLi = imgLi.last()  var firstLi = imgLi.first()
  imgCt.append(imgLi.first().clone())
  imgCt.prepend(imgLi.last().clone())
  //计算图片容器的宽度 错误写法 imgCt.width()=（imgTotal+2）*imgWidth 多加2是因为多增加了两个节点
  imgCt.width((imgTotal+2)*imgWidth)
  //恢复到正常的图片展示顺序 错误写法 imgCt.css(left: -imgWidth)
  imgCt.css({left: -imgWidth})

  //当给按钮绑定事件时 思路断掉了! 子弹定位 27：10
 //非常重要的思路 定位图片 本身 是0 但是要给位移动画带上一个回调函数来记录数值
  var pageIndex = 0

  preBtn.on('click',function (e) {
    e.preventDefault()
    playPre(1)

  })

  nextBtn.on('click',function(e){
    e.preventDefault()
    playNext(1)
  })

  bulletLi.on('click',function () {
    //获取点击下标 如果直接用的话 是有问题的,要改动上一页，下一页方法中的++ --
     var index =  $(this).index() 
    // console.log(index)
  //  一旦获取了那么就要有两个地方进行相应的变化 一个是active 一个是大图
    if ( index > pageIndex ){
      playNext(index - pageIndex)
    }else if( index < pageIndex ){
      playPre(pageIndex - index)
    }

  })


  function playPre(len) {
    // if(len = 'undefined'){
    //   len = 1
    // }
    if(animateLock) return;
    animateLock = true
    imgCt.animate({
      left: '+='+ len*imgWidth
    },function () {
      // pageIndex--
      pageIndex -= len
      if( pageIndex < 0  ){
        //记得减1
        pageIndex = imgTotal-1
        //这一块儿的计算 自己没有想起来
        imgCt.css({left: -imgWidth*imgTotal})
      }
      activeBullet()
      animateLock = false
    })

  }


  function playNext(len) {
    if(len = 'undefined'){
      len = 1
    }
    if(animateLock) return;
    animateLock = true
    imgCt.animate({
      // '-=' 在imgCt原来的left基础上再接着减去一个图片的宽度
      left: '-=' + len*imgWidth
    },function () {
      // pageIndex++
      pageIndex += len
      if( pageIndex === imgTotal){
        pageIndex = 0
        imgCt.css({left: -imgWidth})
      }
      activeBullet()
      animateLock = false
    })
  }

  function activeBullet(){
    bulletLi.removeClass('active')
            .eq(pageIndex)
            .addClass('active')
  }



//做一个定时器，让轮播图自己动起来
   setInterval(function(){
     playNext()
   },1000)


})