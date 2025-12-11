import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with URLs.
 * Extends CommonPick without additional methods.
 */

export class URLPick<T extends URL | string> extends CommonPick<T> {}
