import { ElevatorEvent } from "../apis/elevator_event";
import { Elevator } from "../apis/elevator_saga";
import { Direction } from "../apis/global_type";

/**
 * ステップ数計算のテストなどに使用するテスト用エレベーターオブジェクト。
 * 実装はテストに必要なもののみに留めてある。
 */
export class TestElevator implements Elevator {
	/**
	 * エレベーターがある階
	 */
	private readonly currentFloorNum: number;

	/**
	 * エレベーターが動く方向。
	 * テストのため、"stopped"以外にする。
	 */
	private readonly direction: Direction;

	public destinationQueue: number[];

	/**
	 * コンストラクタ
	 * @param initialFloorNum エレベーターの初期の階
	 * @param initialDirection エレベーターの動く方向の初期状態。テストのため、"stopped"以外にする。
	 * @param initialQueue エレベーターの初期の予約リスト
	 */
	constructor(initialFloorNum: number, initialDirection: Direction, initialQueue: number[]) {
		this.currentFloorNum = initialFloorNum;
		this.direction = initialDirection;
		this.destinationQueue = initialQueue;
	}

	public goToFloor(floorNum: number, immediately?: boolean | undefined): void {
	}

	public stop(): void {
	}

	public currentFloor(): number {
		return this.currentFloorNum;
	}

	public goingUpIndicator(indicatorLit?: boolean | undefined): boolean {
		return this.direction == "up";
	}

	public goingDownIndicator(indicatorLit?: boolean | undefined): boolean {
		return this.direction == "down";
	}

	public maxPassengerCount(): number {
		return 0;
	}

	public loadFactor(): number {
		return 0;
	}

	public destinationDirection(): Direction {
		return this.direction;
	}

	public checkDestinationQueue(): void {
	}

	public getPressedFloors(): number[] {
		return [];
	}

	public on<T extends keyof ElevatorEvent>(event: T, eventFunction: ElevatorEvent[T]): void {
	}

	public off<T extends keyof ElevatorEvent>(event: T, eventFunction: ElevatorEvent[T]): void {
	}
}