/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/unbound-method */
import { EventEmitter } from 'events';

import type { 
  EventName, 
  Events
} from '../../types/program/events';

export class InterfaceEventEmitter extends EventEmitter {
  addListener<T extends EventName>(eventName: T, listener: (arg: Events[T]) => void): this {
    return super.addListener(eventName, listener);
  }

  on = this.addListener;

  once<T extends EventName>(eventName: T, listener: (arg: Events[T]) => void): this {
    return super.once(eventName, listener);
  }

  removeListener<T extends EventName>(eventName: T, listener: (arg: Events[T]) => void): this {
    return super.removeListener(eventName, listener);
  }

  off = this.removeListener;

  removeAllListeners(event?: EventName): this {
    return super.removeAllListeners(event);
  }

  listeners(eventName: EventName): Function[] {
    return super.listeners(eventName);
  }

  rawListeners(eventName: EventName): Function[] {
    return super.rawListeners(eventName);
  }

  emit<T extends EventName>(eventName: T, arg: Events[T]): boolean {
    if(eventName.toLowerCase().includes('node')) {
      super.emit('nodeChange');
    }

    if(eventName.toLowerCase().includes('view')) {
      super.emit('viewChange');
    }

    return super.emit(eventName, arg);
  }

  listenerCount(eventName: EventName): number {
    return super.listenerCount(eventName);
  }

  prependListener<T extends EventName>(eventName: T, listener: (arg: Events[T]) => void): this {
    return super.prependListener(eventName, listener);
  }

  prependOnceListener<T extends EventName>(eventName: T, listener: (arg: Events[T]) => void): this {
    return super.prependOnceListener(eventName, listener);
  }

  eventNames(): EventName[] {
    return super.eventNames() as EventName[]; 
  }
}
