/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCTopAppBarAdapter} from '../adapter';
import {cssClasses} from '../constants';
import {MDCTopAppBarFoundation} from '../standard/foundation';

class MDCFixedTopAppBarFoundation extends MDCTopAppBarFoundation {
  /**
   * State variable for the previous scroll iteration top app bar state
   */
  private wasScrolled_ = false;

  /* istanbul ignore next */
  constructor(adapter?: Partial<MDCTopAppBarAdapter>) {
    super(adapter);

    this.scrollHandler_ = () => this.fixedScrollHandler_();
  }

  init() {
    super.init();
  }

  destroy() {
    super.destroy();
  }

  /**
   * Scroll handler for applying/removing the modifier class on the fixed top app bar.
   */
  fixedScrollHandler_() {
    const currentScroll = this.adapter_.getViewportScrollY();

    if (currentScroll <= 0) {
      if (this.wasScrolled_) {
        this.adapter_.removeClass(cssClasses.FIXED_SCROLLED_CLASS);
        this.wasScrolled_ = false;
      }
    } else {
      if (!this.wasScrolled_) {
        this.adapter_.addClass(cssClasses.FIXED_SCROLLED_CLASS);
        this.wasScrolled_ = true;
      }
    }
  }
}

export {MDCFixedTopAppBarFoundation as default, MDCFixedTopAppBarFoundation};
