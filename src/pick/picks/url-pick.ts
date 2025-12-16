import { CommonPick } from "./common-pick.js";
import { URLPattern } from "urlpattern-polyfill";

interface URLPatternInit {
  baseURL?: string;
  username?: string;
  password?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

export type URLPatternInput = URLPatternInit | string;

/**
 * Specialized class for working with URLs.
 * Extends CommonPick without additional methods.
 */
export class URLPick<T extends URL | string> extends CommonPick<T> {
  pattern(input?: URLPatternInput, baseURL?: string): undefined | URLPick<T> {
    if (!new URLPattern(input, baseURL).test(this.value, baseURL))
      return undefined;
    return this;
  }
}
