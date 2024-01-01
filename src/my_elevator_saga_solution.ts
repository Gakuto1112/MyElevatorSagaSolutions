import { Elevator, ElevatorSaga, Floor } from "./apis/elevator_saga";
import { Direction } from "./apis/global_type";

/**
 * 各階の呼び出しボタンの状態を保持するオブジェクト
 */
interface FloorButtonData {
	/** 上ボタン */
	up: boolean;
	/** 下ボタン */
	down: boolean;
}

/**
 * エレベーターの所要時間を計算した結果を保持するオブジェクト
 */
interface StepData {
	/**
	 * エレベーターの所要時間
	 */
	steps: number;
	/**
	 * このエレベーターの予約リストに目的の階登録する場合に入れるべき場所。
	 * この値のインデックス番号の前に挿入する。
	 * -1は目的化を予約リストに入れるべきでないことを示す。
	 */
	queuePos: number;
}

/**
 * エレベーターの呼び出しの際に最適なエレベーターを計算する途中で使用するオブジェクト
 */
interface BestElevatorData {
	/**
	 * エレベーター番号（インデックス）
	 */
	index: number;

	/**
	 * エレベーターの所要時間
	 */
	steps: number;
	/**
	 * このエレベーターの予約リストに目的の階登録する場合に入れるべき場所。
	 * この値のインデックス番号の前に挿入する。
	 * -1は目的化を予約リストに入れるべきでないことを示す。
	 */
	queuePos: number;
}

export class MyElevatorSagaSolution implements ElevatorSaga {
	/**
	 * 各階の呼び出しボタンの状態を保持する変数
	 */
	private readonly floorButtons: FloorButtonData[] = [];

	/**
	 * チャレンジの開始時に一度だけ実行される関数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	public init(elevators: Elevator[], floors: Floor[]): void {
		/**
		 * 指定したエレベーターが目的の階に到着するまで要するステップ数を計算する。
		 * @param elevatorNum 計算を行う対象のエレベーターの番号
		 * @param targetFloorNum 目的の階
		 * @param direction エレベーターが目的の階に停止する際のエレベーターの向き。"up"又は"down"のいずれか。
		 * @returns エレベーターが目的の階に到着するまでの所要ステップ数と予約リストに入れるべき場所を含むオブジェクト
		 */
		function calcElevatorSteps(elevatorNum: number, targetFloorNum: number, direction: Direction): StepData {
			//変数の初期化など
			if(direction == "stopped") return {steps: -1, queuePos: -1}; //エレベーターの移動方向の指定が不正であるため、空のデータを返す。
			const targetDirectionNum: number = direction == "up" ? 1 : -1;
			let currentDirectionNum: number = elevators[elevatorNum].goingUpIndicator() ? 1 : elevators[elevatorNum].goingDownIndicator() ? -1 : 0; //現在のエレベーターの移動方向
			let currentFloorNum: number = elevators[elevatorNum].currentFloor(); //現在エレベーターがある階
			let steps: number = 0;
			let queuePos: number = 0;
			const elevatorQueue: number[] = elevators[elevatorNum].destinationQueue.map((queue: number) => queue); //エレベーターの予約リストのコピー

			//予約リストを基にエレベーターを動かしてステップ数を求める。
			while(elevatorQueue.length >= 1) {
				//エレベーターが移動中
				while(currentFloorNum != elevatorQueue[0]) {
					if(currentFloorNum == targetFloorNum && currentDirectionNum == targetDirectionNum) return {steps: steps, queuePos: queuePos};
					currentFloorNum += currentDirectionNum;
					steps++;
				}

				//エレベーターが階で停止
				if(currentFloorNum == targetFloorNum && currentDirectionNum == targetDirectionNum) return {steps: steps, queuePos: -1};
				if(elevatorQueue.length >= 2) {
					//エレベーターの向きを変えるかどうかを判断
					if(currentDirectionNum == 1 && currentFloorNum > elevatorQueue[1]) {
						//エレベーターが上端の折り返し階に到着
						if(currentFloorNum < targetFloorNum) {
							//エレベーターの上端の折り返し階よりも上に目的の階があるため、その階まで上昇する。
							steps += targetFloorNum - currentFloorNum;
							return {steps: steps, queuePos: queuePos};
						}
						else {
							//エレベーターの向きが下に変わる。
							currentDirectionNum = -1;
							if(currentFloorNum == targetFloorNum && targetDirectionNum == -1) return {steps: steps, queuePos: -1};
						}
					}
					else if(currentDirectionNum == -1 && currentFloorNum < elevatorQueue[1]) {
						//エレベーターが下端の折り返し階に到着
						if(currentFloorNum > targetFloorNum) {
							//エレベーターの下端の折り返し階よりも下に目的の階があるため、その階まで下降する。
							steps += currentFloorNum - targetFloorNum;
							return {steps: steps, queuePos: queuePos};
						}
						else {
							//エレベーターの向きが上に変わる。
							currentDirectionNum = 1;
							if(currentFloorNum == targetFloorNum && targetDirectionNum == 1) return {steps: steps, queuePos: -1};
						}
					}
				}
				elevatorQueue.shift();
				queuePos++;
				steps += 5; //エレベーターが停止中は5ステップ消費
			}

			//予約リストが空になった（既に空）ので目的の階まで向かう。
			steps += Math.abs(targetFloorNum - currentFloorNum);
			return {steps: steps, queuePos: queuePos};
		}

		/**
		 * 目的の階に向かうのに最適なエレベーター（所要ステップ数が最小のエレベーター）のインデックス番号を返す。
		 * @param targetFloorNum 目的の階
		 * @param direction エレベーターが目的の階に停止する際のエレベーターの向き。"up"又は"down"のいずれか。
		 * @returns 最適なエレベーターのインデックス番号、所要ステップ数、予約リストに入れるべき場所を含むオブジェクト
		 */
		function calcBestElevator(targetFloorNum: number, direction: Direction): BestElevatorData {
			if(direction == "stopped") return {index: -1, steps: -1, queuePos: -1};
			const firstElevatorData: StepData = calcElevatorSteps(0, targetFloorNum, direction);
			let bestElevator: BestElevatorData = {index: 0, steps: firstElevatorData.steps, queuePos: firstElevatorData.queuePos};
			for(let i = 1; i < elevators.length; i++) {
				const currentElevatorData: StepData = calcElevatorSteps(i, targetFloorNum, direction);
				if(currentElevatorData.steps < bestElevator.steps) bestElevator = {index: i, steps: currentElevatorData.steps, queuePos: currentElevatorData.queuePos};
			}
			return bestElevator;
		}

		/**
		 * エレベーターを指定した階に呼び出す。
		 * 呼び出しの際に必要な処理も行う。
		 * @param thisClass MyElevatorSagaSolutionのインスタンスへの参照
		 * @param elevatorNum 呼び出す対象のエレベーターのインデックス番号
		 * @param targetFloorNum 呼び出し先の階
		 * @param queuePos 予約リスト上での呼び出し先の階の場所
		 */
		function callElevator(thisClass: MyElevatorSagaSolution, elevatorNum: number, targetFloorNum: number, queuePos: number): void {
			//エレベーターの予約リストに登録
			if(queuePos >= 0) {
				elevators[elevatorNum].destinationQueue.splice(queuePos, 0, targetFloorNum);
				elevators[elevatorNum].checkDestinationQueue();
				console.log(elevators[elevatorNum].destinationQueue);
			}

			//エレベーターの上下表示の設定
			if(!(elevators[elevatorNum].goingUpIndicator() || elevators[elevatorNum].goingDownIndicator())) {
				const currentFloorNum: number = elevators[elevatorNum].currentFloor();
				if(currentFloorNum < elevators[elevatorNum].destinationQueue[0]) elevators[elevatorNum].goingUpIndicator(true);
				else if(currentFloorNum > elevators[elevatorNum].destinationQueue[0]) elevators[elevatorNum].goingDownIndicator(true);
				else if(thisClass.floorButtons[currentFloorNum].up) elevators[elevatorNum].goingUpIndicator(true);
				else if(thisClass.floorButtons[currentFloorNum].down) elevators[elevatorNum].goingDownIndicator(true);
			}
		}

		//呼び出しボタンの状態を初期化
		for(let i = 0; i < floors.length; i++) this.floorButtons.push({up: false, down: false});

		elevators.forEach((elevator: Elevator, index: number) => {
			elevator.goingUpIndicator(false);
			elevator.goingDownIndicator(false);
			elevator.on("floor_button_pressed", (floorNum: number) => {
				const stepData: StepData = calcElevatorSteps(index, floorNum, elevator.currentFloor() < floorNum ? "up" : "down");
				callElevator(this, index, floorNum, stepData.queuePos);
			});
			elevator.on("stopped_at_floor", (floorNum: number) => {
				if(elevator.destinationQueue.length >= 1) {
					const currentFloorNum: number = elevator.currentFloor();
					if(currentFloorNum < elevator.destinationQueue[0]) {
						elevator.goingUpIndicator(true);
						elevator.goingDownIndicator(false);
						this.floorButtons[floorNum].up = false;
					}
					else if(currentFloorNum > elevator.destinationQueue[0]) {
						elevator.goingUpIndicator(false);
						elevator.goingDownIndicator(true);
						this.floorButtons[floorNum].down = false;
					}
				}
				else {
					if(elevator.goingDownIndicator()) {
						if(this.floorButtons[floorNum].down) {
							elevator.goingUpIndicator(false);
							elevator.goingDownIndicator(true);
							this.floorButtons[floorNum].down = false;
						}
						else if(this.floorButtons[floorNum].up) {
							elevator.goingUpIndicator(true);
							elevator.goingDownIndicator(false);
							this.floorButtons[floorNum].up = false;
						}
						else {
							elevator.goingUpIndicator(false);
							elevator.goingDownIndicator(false);
						}
					}
					else {
						if(this.floorButtons[floorNum].up) {
							elevator.goingUpIndicator(true);
							elevator.goingDownIndicator(false);
							this.floorButtons[floorNum].up = false;
						}
						else if(this.floorButtons[floorNum].down) {
							elevator.goingUpIndicator(false);
							elevator.goingDownIndicator(true);
							this.floorButtons[floorNum].down = false;
						}
						else {
							elevator.goingUpIndicator(false);
							elevator.goingDownIndicator(false);
						}
					}
				}
			});
		});

		floors.forEach((floor: Floor, index: number) => {
			floor.on("up_button_pressed", () => {
				this.floorButtons[index].up = true;
				const bestElevatorData: BestElevatorData = calcBestElevator(index, "up");
				if(bestElevatorData.index >= 0) callElevator(this, bestElevatorData.index, index, bestElevatorData.queuePos);
			});
			floor.on("down_button_pressed", () => {
				this.floorButtons[index].down = true;
				const bestElevatorData: BestElevatorData = calcBestElevator(index, "down");
				if(bestElevatorData.index >= 0) callElevator(this, bestElevatorData.index, index, bestElevatorData.queuePos);
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