/**
 * このインターフェースはElevator Sagaのドキュメントを基にして作られています。
 * コメントによる各説明文は公式ドキュメントを基に私が和訳しました。
 * https://play.elevatorsaga.com/documentation.html
 */

/**
 * 各階それぞれに関するイベント
 */
export interface FloorEvent {
	/**
	 * この階の上ボタンが押された時に発生するイベント
	 * 上階に行きたい乗客がエレベーターに乗れなかった場合は再び上ボタンを押し、このイベントが発生する。
	 */
	up_button_pressed: () => void;

	/**
	 * この階の下ボタンが押された時に発生するイベント
	 * 下階に行きたい乗客がエレベーターに乗れなかった場合は再び下ボタンを押し、このイベントが発生する。
	 */
	down_button_pressed: () => void;
}