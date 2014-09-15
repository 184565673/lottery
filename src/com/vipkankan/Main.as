package com.vipkankan
{
	import flash.display.Sprite;
	import flash.events.Event;
	import com.vipkankan.Button;
	import com.vipkankan.Light;
	import flash.display.StageScaleMode;
	import flash.display.StageAlign;
	import flash.text.TextField;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.system.Security;
	/**
	 * ...
	 * @author wulin
	 */
	public class Main extends Sprite 
	{
		private var light : Light = new Light();
		private var button : Button =  new Button();
		private var currentRotation : Number = 0;
		private var time : Number = 0; //用于计数
		private var state :Number = 0; // 0 初始状态; 1， 停上去; 2，旋转到奖品 
		private var giftNum : Number;
		private var id : Number;
		private var firtRotation : Number;
		
		
		public function Main():void 
		{
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			
			Security.allowDomain("*");
            Security.allowInsecureDomain("*");
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align = StageAlign.TOP_LEFT;
            stage.showDefaultContextMenu = false;
			
			id = Number(loaderInfo.parameters.id);
			firtRotation = Number(loaderInfo.parameters.startRotation);
			giftNum = Number(loaderInfo.parameters.prizeNum);
			
			light.x = (stage.stageWidth) / 2;
			light.y = (stage.stageHeight)/ 2;	
			button.x = (stage.stageWidth - button.width) / 2 + 53;
			button.y = (stage.stageHeight - button.height) / 2 + 64;
			this.addChild(light);
			this.addChild(button);
			
			addEventListener(Event.ENTER_FRAME, enterFrameHandler);
			button.addEventListener(MouseEvent.CLICK, onClickHandler);
			
			ExternalInterface.addCallback('reset', reset);
			ExternalInterface.addCallback('stop', stop);
			ExternalInterface.addCallback('resultOn', resultOn);
			ExternalInterface.addCallback('log', log);
		}
		
		private function log():String {
			return light.width + '--' + light.height +'--'+stage.width+'---'+stage.height + '----'+stage.stageWidth+'---'+stage.stageHeight;
		}
		private function reset():void {
			button.mouseEnabled = true;
			state = 0;
		}
		
		private function stop() : void {
			state = 1;
		}
		
		private var result:Number;
		private var startRotation:Number;
		private var resultOnNum : Number;
		private function resultOn(num:Number):void {
			button.mouseEnabled = false;
			result = currentRotation + (360 - currentRotation % 360) + 360*2 + 360 * (num - firtRotation - 1) / giftNum ;
			startRotation = currentRotation;
			time = 0;
			resultOnNum = num;
			state = 2;
		}
		
		private function enterFrameHandler(event:Event):void {
			switch(state) {
				case 0 :
					currentRotation++
					light.rotation = currentRotation;
					break;
				case 1 :
					break;
				case 2 :
					if (time <= 804) {
						currentRotation = startRotation + (result - startRotation) * animate(time / 804);
						
						if (time == 804) {
							ExternalInterface.call('lottery' + id + 'ResultEnd',resultOnNum);
						}
					}else if(time > 2000) {
						reset();
					}
					time += 12;
					light.rotation = currentRotation;
			}
			
		}
		
		private function onClickHandler(event:MouseEvent):void {
			ExternalInterface.call('luck' + id + 'Click');
		}
		
		private function animate(t:Number):Number {
			return 1 - (t-1) * (t-1);
		}
	}
	
}