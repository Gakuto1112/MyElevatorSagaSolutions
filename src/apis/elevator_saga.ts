/**
 * このインターフェースはElevator Sagaのドキュメントを基にして作られています。
 * コメントによる各説明文は公式ドキュメントを基に私が和訳しました。
 * https://play.elevatorsaga.com/documentation.html
 */

import { ElevatorEvent } from "./elevator_event";
import { FloorEvent } from "./floor_event";
import { Direction } from "./global_type";

/**
 * Elevator Sagaで使用するコードの基本インターフェース
 */
export interface ElevatorSaga {
	/**
	 * チャレンジの開始時に一度だけ実行される関数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	init(elevators: Elevator[], floors: Floor[]): void;

	/**
	 * チャレンジの実行中に繰り返し実行される関数
	 * @param dt 前回この関数が呼び出されたから経過したゲーム内での秒数
	 * @param elevators このチャレンジで利用可能なエレベーターのオブジェクトの配列
	 * @param floors このチャレンジにある各階のオブジェクトの配列
	 */
	update(dt: number, elevators: Elevator[], floors: Floor[]): void;
}

/**
 * エレベーター自身を示すオブジェクト
 */
export interface Elevator {
	/**
	 * エレベーターを指定した階に停めるように予約する。
	 * @param floorNum エレベーターを停める階
	 * @param immediately `true`にすると現在の予約リストに割り込んで、最優先でその指定した階にエレベーターを向かわせる。
	 */
	goToFloor(floorNum: number, immediately? : boolean): void;

	/**
	 * エレベーターの予約リストを消去し、直ちにエレベーターを停止させる。
	 * この命令は高度な制御で利用されるものであり、通常は使用しないことに注意すること。
	 * また、エレベーターが階の途中で停止する場合もあり、その場合は乗客は乗降しない。
	 */
	stop(): void;

	/**
	 * エレベーターが現在いる階を返す。
	 * @returns エレベーターが現在いる階
	 */
	currentFloor(): number;

	/**
	 * エレベーターの上昇表示の状態を取得又は設定する。
	 * この表示は階で停止している際の乗客の挙動に影響する。
	 * @param indicatorLit 設定するエレベーターの上昇表示
	 * @returns 取得したエレベーターの上昇表示
	 */
	goingUpIndicator(indicatorLit: boolean): boolean;

	/**
	 * エレベーターの下降表示の状態を取得又は設定する。
	 * この表示は階で停止している際の乗客の挙動に影響する。
	 * @param indicatorLit 設定するエレベーターの下降表示
	 * @returns 取得したエレベーターの下降表示
	 */
	goingDownIndicator: (indicatorLit: boolean) => boolean;

	/**
	 * このエレベーターの一度に乗車可能な人数を返す。
	 * @returns このエレベーターの一度に乗車可能な人数
	 */
	maxPassengerCount(): number;

	/**
	 * エレベーターの負荷率を返す。
	 * @returns エレベーターの負荷率。この値は0~1で表され、0は誰も乗っていない、1は満員を示す。この値は乗客の数に応じて変化し、正確な指標ではない。
	 */
	loadFactor(): number;

	/**
	 * 現在のエレベーターの移動方向を返す。
	 * @returns 現在のエレベーターの移動方向
	 */
	destinationDirection(): Direction;

	/**
	 * エレベーターの行き先階の予約リスト
	 * このエレベーターが向かい予定の階が格納されている。
	 * 必要に応じでリストを変更したり空にしたりできる。
	 * リストを変更した場合は`checkDestinationQueue()`を呼び出して今すぐ予約リストの変更を適用できる。
	 */
	destinationQueue: number[];

	/**
	 * 予約リストが変更されていないか確認する。
	 * `destinationQueue`を自身で変更した場合のみに呼び出せばよい。
	 */
	checkDestinationQueue(): void;

	/**
	 * エレベーター内で押された行き先階ボタンの配列を返す。
	 * @returns エレベーター内で押された行き先階ボタンの配列
	 */
	getPressedFloors(): number[];

	/**
	 * エレベーターに関するイベント関数を登録する。
	 * - `idle`: 予約リストを全て消化し、エレベーターがすべきことが無くなった時に発生するイベント
 	 * - `floor_button_pressed`: エレベーター内の行き先階ボタンが押された時に発生するイベント
 	 * - `passing_floor`: エレベーターが階を通過する直前に発生するイベント
 	 * - `stopped_at_floor`: エレベーターが階に到着した時に発生するイベント
	 * @param event 登録するイベントの種類
	 * @param eventFunction 対象のイベントが発生した際に実行される関数
	 */
	on<T extends keyof ElevatorEvent>(event: T, eventFunction: ElevatorEvent[T]): void;

	/**
	 * 登録したエレベーターのイベント関数を削除する。
	 * - `idle`: 予約リストを全て消化し、エレベーターがすべきことが無くなった時に発生するイベント
 	 * - `floor_button_pressed`: エレベーター内の行き先階ボタンが押された時に発生するイベント
 	 * - `passing_floor`: エレベーターが階を通過する直前に発生するイベント
 	 * - `stopped_at_floor`: エレベーターが階に到着した時に発生するイベント
	 * @param event 登録解除するイベント関数のイベントの種類
	 * @param eventFunction 登録解除するイベント関数
	 */
	off<T extends keyof ElevatorEvent>(event: T, eventFunction: ElevatorEvent[T]): void;
}

/**
 * 各階それぞれを示すオブジェクト
 */
export interface Floor {
	/**
	 * この階の番号を返す。
	 * @returns 階の番号
	 */
	floorNum(): number;

	/**
	 * 各階それぞれに関するイベント関数を登録する。
	 * - `up_button_pressed`: この階の上ボタンが押された時に発生するイベント
 	 * - `down_button_pressed`: この階の下ボタンが押された時に発生するイベント
	 * @param event 登録するイベントの種類
	 * @param eventFunction 対象のイベントが発生した際に実行される関数
	 */
	on<T extends keyof FloorEvent>(event: T, eventFunction: FloorEvent[T]): void;

	/**
	 * 登録した各階それぞれに関するイベント関数を削除する。
	 * - `up_button_pressed`: この階の上ボタンが押された時に発生するイベント
 	 * - `down_button_pressed`: この階の下ボタンが押された時に発生するイベント
	 * @param event 登録解除するイベント関数のイベントの種類
	 * @param eventFunction 登録解除するイベント関数
	 */
	off<T extends keyof FloorEvent>(event: T, eventFunction: FloorEvent[T]): void;
}