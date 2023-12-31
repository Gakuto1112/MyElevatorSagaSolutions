import { Elevator, ElevatorSaga, Floor } from "./apis/elevator_saga";

class MyElevatorSagaSolution implements ElevatorSaga {
	/**
	 * チャレンジの開始時に一度だけ実行される関数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	public init(elevators: Elevator[], floors: Floor[]): void {
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