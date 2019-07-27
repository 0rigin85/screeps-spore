import { Actions } from './generated/actions_generated';
import { Hash } from '../common/hash';

interface Symbol {
  compile(env, expr);
}

export class Environment {
  actors: Record<string, number>;
  builder: flatbuffers.Builder;
}

export class Compiler {
  symbols: Record<string, any>;

  compile(env, expr): any {

    

    // enumerate all nodes (and actors?)
    // compile buffer

    return this.compile_jexpr(env, expr) || this.compile_sym(env, expr);
  }

  private toUpperFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private lookupSymbol(env, sym) {
    return env.symbols[sym];
  }

  private operatorName(obj): string {
    if (obj && obj.constructor === Object) {
      for (var k in obj) {
        return this.toUpperFirstLetter(k);
      }
    } else {
      return undefined;
    }
  }

  private compile_jexpr(env, jexpr) {
    if (jexpr && jexpr.constructor === Object) {
      var op = this.lookupSymbol(env, this.operatorName(jexpr));
      if (op && op.constructor === Function) {
        return op(env, jexpr);
      }
    } else if (jexpr && jexpr.constructor === Array) {
        // link
    }

    return undefined;
  }

  private compile_sym(env, sym): any {
    if (sym && sym.constructor === String) {
      return this.lookupSymbol(env, sym);
    }

    return undefined;
  }

  private compile_actor(env: Environment, obj: any): number {
    let actorStr = undefined;

    if (obj instanceof RoomObject) {
      actorStr = Ptr.from(obj).toString();
    } else if (obj) {
      actorStr = obj.toString();
    }

    let actor = undefined;

    if (actorStr) {
      actor = env.actors[actorStr];

      if (actor === undefined || actor === null) {
        Actions.Actor.startActor(env.builder);
        Actions.Actor.addHash(env.builder, Hash.string(actorStr));
        Actions.Actor.addRef(env.builder, actorStr);
        actor = Actions.Actor.endActor(env.builder);
      }
    }

    return actor;
  }

  private compile_lit(env, expr): string {
    if (expr === undefined || expr === null) {
      return JSON.stringify(expr);
    }

    if (expr.constructor === Number || expr.constructor == Boolean) {
      return JSON.stringify(expr);
    }

    return undefined;
  }
}

export class ActionStream {
  readonly compiler: Compiler;

  static encode(object: any, globals?: Record<string, any>): Uint8Array {
    const actions: Record<string, any> = {};
    actions['Harvest'] = Actions.Harvest;
    actions['Loop'] = Actions.Loop;
    actions['MoveTo'] = Actions.MoveTo;

    // convert object into flatbuffer
    const env = new Environment(globals);
    Compiler.compile(env, object);

    const actors: Record<string, Actions.Actor> = {};
    const actions: Record<string, Actions.Action> = {};

    let array = new Uint8Array();

    return array;
  }

  static decode(value: string): any {
    return null;
  }
}
