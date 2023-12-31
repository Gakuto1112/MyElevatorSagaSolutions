/**
 * このインターフェースはElevator Sagaのドキュメントを基にして作られています。
 * コメントによる各説明文は公式ドキュメントを基に私が和訳しました。
 * https://play.elevatorsaga.com/documentation.html
 */

import { Direction } from "./global_type";

/**
 * エレベーターに関するイベント
 */
export interface ElevatorEvent {
	/**
	 * 予約リストを全て消化し、エレベーターがすべきことが無くなった時に発生するイベント
	 */
	idle: () => void;

	/**
	 * エレベーター内の行き先階ボタンが押された時に発生するイベント
	 * @param floorNum 押された行き先階
	 */
	floor_button_pressed: (floorNum: number) => void;

	/**
	 * エレベーターが階を通過する直前に発生するイベント
	 * この階に停止するか否かを判断する機会である。
	 * このイベントは目的階では発生しない。
	 * @param floorNum このイベントの直後に通過する階
	 * @param direction エレベーターが動いている方向。`up`又は`down`のいずれかが入る。
	 */
	passing_floor: (floorNum: number, direction: Direction) => void;

	/**
	 * エレベーターが階に停止した時に発生するイベント
	 * @param floorNum エレベーターが停止した階
	 */
	stopped_at_floor: (floorNum: number) => void;
}