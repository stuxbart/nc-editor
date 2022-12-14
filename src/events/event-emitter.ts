/**
 * src: https://rjzaworski.com/2019/10/event-emitters-in-typescript
 *
 * interface TestEvents {
 *     add: number;
 * }
 * export class TestClass extends EventEmitter<TestEvents> {
 * 	   public add(a: number, b: number): number {
 * 		   this.emit('add', a + b);
 * 		   return a + b;
 * 	   }
 * }
 */

import { EventEmitter as Emitter } from 'events';

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface IEmitter<T extends EventMap> {
	on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export class EventEmitter<T extends EventMap> implements IEmitter<T> {
	private _emitter = new Emitter();
	public on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
		this._emitter.on(eventName, fn);
	}

	public off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
		this._emitter.off(eventName, fn);
	}

	public emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
		this._emitter.emit(eventName, params);
	}
}
