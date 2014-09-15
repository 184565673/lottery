lottery
=======

一个兼容所有浏览器的抽奖


调用示例 
var lottery = new Lottery('container',8,0);  //容器id、奖品个数、第1个奖品指针的角度/360

lottery.on('click',function () {
	lottery.resultOn(Math.floor(Math.random()*8)); //顺时针方向第几个
})
lottery.on('resultEnd',function (num) {
	alert('抽中了第'+num+'个');
})
