import { Direction } from "./apis/global_type";
import { Elevator, ElevatorSaga, Floor } from "./apis/elevator_saga";

/**
 * `getElevatorSteps()`で返されるデータ
 */
interface StepData {
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

class MyElevatorSagaSolution implements ElevatorSaga {
	/**
	 * `getElevatorSteps()`での停車時に加算するステップ数
	 */
	private readonly ELEVATOR_STOP_STEPS: number = 5;

	/**
	 * 指定したエレベーターが指定したフロアまで到着するのに要するステップ数やキューに入れる位置を算出する。
	 * @param elevator 計算対象のエレベーター
	 * @param targetFloorNum 目的の階の番号
	 * @returns 算出結果データ
	 */
	private getElevatorSteps(elevator: Elevator, targetFloorNum: number, direction: Direction): StepData {
		//初期化
		let steps: number = 0;
		const elevatorQueue: number[] = elevator.destinationQueue.map((floorNum: number) => floorNum);
		let currentFloor: number = elevator.currentFloor();
		if(direction == "stopped") return {steps: -1, queuePos: -1};
		const targetDirectionNum: number = direction == "up" ? 1 : -1;
		const currentDirection: Direction = elevator.destinationDirection();
		let currentDirectionNum: number = 0;
		switch(currentDirection) {
			case "up":
				currentDirectionNum = 1;
				break;
			case "down":
				currentDirectionNum = -1;
				break;
			case "stopped":
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
					if(currentFloor < targetFloorNum && currentDirectionNum == targetDirectionNum) {
						steps += targetFloorNum - currentFloor + 1;
						queuePos++;
						return {steps: steps, queuePos: queuePos};
					}
					currentDirectionNum = -1; //エレベーターの向きが下に変わる
				}
				else if(currentDirectionNum == -1 && elevatorQueue[0] < elevatorQueue[1]) {
					if(currentFloor > targetDirectionNum && currentDirectionNum == targetDirectionNum) {
						steps += currentFloor - targetFloorNum + 1;
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
		steps += Math.abs(targetFloorNum - currentFloor) + 1;
		return {steps: steps, queuePos: queuePos};
	}

	/**
	 * チャレンジの開始時に一度だけ実行される関数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	public init(elevators: Elevator[], floors: Floor[]): void {
		elevators.forEach((elevator: Elevator) => {
			elevator.on("floor_button_pressed", (floorNum: number) => {
				const currentFloor: number = elevator.currentFloor();
				const stepData: StepData = this.getElevatorSteps(elevator, floorNum, floorNum > currentFloor ? "up" : "down");
				elevator.destinationQueue.splice(stepData.queuePos, 0, floorNum);
				elevator.checkDestinationQueue();
			});
		});
		floors.forEach((floor: Floor) => {
			function callElevator(thisClass: MyElevatorSagaSolution, floor: number, direction: Direction): void {
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

				//エレベーターを手配
				elevators[bestElevatorNum].destinationQueue.splice(stepData.queuePos, 0, floor);
				elevators[bestElevatorNum].checkDestinationQueue();
			}

			floor.on("up_button_pressed", () => callElevator(this, floor.floorNum(), "up"));
			floor.on("down_button_pressed", () => callElevator(this, floor.floorNum(), "down"));
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