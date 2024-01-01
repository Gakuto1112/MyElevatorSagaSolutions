import { Direction } from "./apis/global_type";
import { Elevator, ElevatorSaga, Floor } from "./apis/elevator_saga";

/**
 * 各階の上下ボタンの状態を保持する構造体
 */
export interface ButtonData {
	/** 上ボタン */
	up: boolean;
	/** 下ボタン */
	down: boolean;
}

/**
 * `getElevatorSteps()`で返されるデータ
 */
export interface StepData {
	/**
	 * エレベーターが指定した階に到着するまでに要するステップ数
	 */
	steps: number;
	/**
	 * この階をキューに挿入すべき場所（インデックス番号）
	 * -1はこの階をキューに挿入すべきではないことを示す。
	 */
	queuePos: number;
}

export class MyElevatorSagaSolution implements ElevatorSaga {
	/**
	 * `getElevatorSteps()`での停車時に加算するステップ数
	 */
	private readonly ELEVATOR_STOP_STEPS: number = 5;

	/**
	 * 各階の上下ボタンの状態
	 */
	private readonly FloorButtons: ButtonData[] = [];

	/**
	 * 指定したエレベーターが指定したフロアまで到着するのに要するステップ数やキューに入れる位置を算出する。
	 * @param elevator 計算対象のエレベーター
	 * @param targetFloorNum 目的の階の番号
	 * @returns 算出結果データ
	 */
	public getElevatorSteps(elevator: Elevator, targetFloorNum: number, direction: Direction): StepData {
		//初期化
		let steps: number = 0;
		const elevatorQueue: number[] = elevator.destinationQueue.map((floorNum: number) => floorNum);
		let currentFloor: number = elevator.currentFloor();
		if(direction == "stopped") return {steps: -1, queuePos: -1};
		const targetDirectionNum: number = direction == "up" ? 1 : -1;
		const currentDirection: Direction = elevator.goingUpIndicator() ? "up" : elevator.goingDownIndicator() ? "down" : "stopped";
		let currentDirectionNum: number = 0;
		switch(currentDirection) {
			case "up":
				currentDirectionNum = 1;
				break;
			case "down":
				currentDirectionNum = -1;
				break;
			case "stopped":
				console.log("A");
				if(currentFloor < targetFloorNum) currentDirectionNum = 1;
				else if(currentFloor > targetFloorNum) currentDirectionNum = -1;
				else return {steps: 0, queuePos: 0};
		}
		let queuePos: number = 0;

		//ステップ数を計算
		while(elevatorQueue.length > 0) {
			//エレベーターが移動中
			while(currentFloor != elevatorQueue[0]) {
				if(currentFloor == targetFloorNum && currentDirectionNum == targetDirectionNum) return {steps: steps, queuePos: queuePos};
				currentFloor += currentDirectionNum;
				steps++;
			}

			//エレベーターが階に到着
			if(currentFloor == targetFloorNum && currentDirectionNum == targetDirectionNum) return {steps: steps, queuePos: -1};
			steps += this.ELEVATOR_STOP_STEPS;
			if(elevatorQueue.length >= 2) {
				if(currentDirectionNum == 1 && elevatorQueue[0] > elevatorQueue[1]) {
					if(currentFloor < targetFloorNum && currentDirectionNum != targetDirectionNum) {
						steps += targetFloorNum - currentFloor;
						queuePos++;
						return {steps: steps, queuePos: queuePos};
					}
					currentDirectionNum = -1; //エレベーターの向きが下に変わる
				}
				else if(currentDirectionNum == -1 && elevatorQueue[0] < elevatorQueue[1]) {
					if(currentFloor > targetDirectionNum && currentDirectionNum != targetDirectionNum) {
						steps += currentFloor - targetFloorNum;
						queuePos++;
						return {steps: steps, queuePos: queuePos};
					}
					currentDirectionNum = 1; //エレベーターの向きが上に変わる
				}
			}
			elevatorQueue.shift();
			queuePos++;
		}

		//エレベーターが目的の階に向かう
		steps += Math.abs(targetFloorNum - currentFloor);
		return {steps: steps, queuePos: queuePos};
	}

	/**
	 * エレベーターを手配する。
	 * @param elevator 手配対象のエレベーター
	 * @param destinationFloorNum 呼び出し先の階
	 * @param queuePos 予約リストに挿入する場所
	 * @param direction エレベーターを動かす方向
	 */
	public callElevator(elevator: Elevator, destinationFloorNum: number, queuePos: number): void {
		if(elevator.destinationQueue.length == 0) {
			const currentPos: number = elevator.currentFloor();
			if(currentPos < destinationFloorNum) elevator.goingUpIndicator(true);
			else if(currentPos > destinationFloorNum) elevator.goingDownIndicator(true);
		}
		elevator.destinationQueue.splice(queuePos, 0, destinationFloorNum);
		elevator.checkDestinationQueue();
	}

	/**
	 * チャレンジの開始時に一度だけ実行される関数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	public init(elevators: Elevator[], floors: Floor[]): void {
		for(let i = 0; i < floors.length; i++) this.FloorButtons.push({up: false, down: false});
		elevators.forEach((elevator: Elevator) => {
			elevator.goingUpIndicator(false);
			elevator.goingDownIndicator(false);
			elevator.on("floor_button_pressed", (floorNum: number) => {
				const currentFloor: number = elevator.currentFloor();
				const stepData: StepData = this.getElevatorSteps(elevator, floorNum, floorNum > currentFloor ? "up" : "down");
				this.callElevator(elevator, floorNum, stepData.queuePos);
			});
			elevator.on("stopped_at_floor", (floorNum: number) => {
				if(elevator.destinationQueue.length >= 1) {
					if(floorNum < elevator.destinationQueue[0]) {
						elevator.goingUpIndicator(true);
						elevator.goingDownIndicator(false);
					}
					else if(floorNum > elevator.destinationQueue[0]) {
						elevator.goingUpIndicator(false);
						elevator.goingDownIndicator(true);
					}
				}
				else if(elevator.goingDownIndicator()) {
					if(this.FloorButtons[floorNum].down) {
						elevator.goingUpIndicator(false);
						elevator.goingDownIndicator(true);
						this.FloorButtons[floorNum].down = false;
					}
					else if(this.FloorButtons[floorNum].up) {
						elevator.goingUpIndicator(true);
						elevator.goingDownIndicator(false);
						this.FloorButtons[floorNum].up = false;
					}
					else {
						elevator.goingUpIndicator(false);
						elevator.goingDownIndicator(false);
					}
				}
				else {
					if(this.FloorButtons[floorNum].up) {
						elevator.goingUpIndicator(true);
						elevator.goingDownIndicator(false);
						this.FloorButtons[floorNum].up = false;
					}
					else if(this.FloorButtons[floorNum].down) {
						elevator.goingUpIndicator(false);
						elevator.goingDownIndicator(true);
						this.FloorButtons[floorNum].down = false;
					}
					else {
						elevator.goingUpIndicator(false);
						elevator.goingDownIndicator(false);
					}
				}
			});
		});
		floors.forEach((floor: Floor) => {
			function selectElevator(thisClass: MyElevatorSagaSolution, floor: number, direction: Direction): void {
				//最適なエレベーターを求める。
				let bestElevatorNum: number = 0;
				let stepData: StepData = thisClass.getElevatorSteps(elevators[0], floor, direction);
				for(let i = 1; i < elevators.length; i++) {
					let newStepData = thisClass.getElevatorSteps(elevators[i], floor, direction);
					if(newStepData.steps < stepData.steps) {
						bestElevatorNum = i;
						stepData = newStepData;
					}
				}
				thisClass.callElevator(elevators[bestElevatorNum], floor, stepData.queuePos);
			}

			floor.on("up_button_pressed", () => {
				this.FloorButtons[floor.floorNum()].up = true;
				selectElevator(this, floor.floorNum(), "up");
			});
			floor.on("down_button_pressed", () => {
				this.FloorButtons[floor.floorNum()].down = true;
				selectElevator(this, floor.floorNum(), "down");
			});
		});
	}

	/**
	 * チャレンジの実行中に繰り返し実行される関数
	 * @param dt 前回この関数が呼び出されたから経過したゲーム内での秒数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	public update(dt: number, elevators: Elevator[], floors: Floor[]): void {
	}
}