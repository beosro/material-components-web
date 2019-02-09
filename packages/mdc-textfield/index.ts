/**
 * @license
 * Copyright 2016 Google Inc.
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

import {MDCComponent} from '@material/base/component';
import {EventType, SpecificEventListener} from '@material/base/index';
import * as ponyfill from '@material/dom/ponyfill';
import {MDCFloatingLabel} from '@material/floating-label/index';
import {MDCLineRipple} from '@material/line-ripple/index';
import {MDCNotchedOutline} from '@material/notched-outline/index';
import {MDCRipple, MDCRippleFoundation, RippleCapableSurface} from '@material/ripple/index';
import {MDCTextFieldCharacterCounter, MDCTextFieldCharacterCounterFoundation} from './character-counter';
import {cssClasses, strings} from './constants';
import {MDCTextFieldFoundation} from './foundation';
import {MDCTextFieldHelperText, MDCTextFieldHelperTextFoundation} from './helper-text';
import {MDCTextFieldIcon} from './icon';
import {
  CharacterCounterFactory,
  FoundationMapType,
  HelperTextFactory,
  IconFactory,
  LabelFactory,
  LineRippleFactory,
  OutlineFactory,
  RippleFactory,
} from './types';

class MDCTextField extends MDCComponent<MDCTextFieldFoundation> implements RippleCapableSurface {
  static attachTo(root: Element): MDCTextField {
    return new MDCTextField(root);
  }

  // Public visibility for these properties is required by RippleCapableSurface.
  root_!: HTMLElement; // assigned in MDCComponent constructor
  ripple!: MDCRipple | null; // assigned in initialize()

  // The only required sub-element.
  private input_!: HTMLInputElement; // assigned in initialize()

  // Optional sub-elements.
  private characterCounter_!: MDCTextFieldCharacterCounter | null; // assigned in initialize()
  private helperText_!: MDCTextFieldHelperText | null; // assigned in initialize()
  private label_!: MDCFloatingLabel | null; // assigned in initialize()
  private leadingIcon_!: MDCTextFieldIcon | null; // assigned in initialize()
  private lineRipple_!: MDCLineRipple | null; // assigned in initialize()
  private outline_!: MDCNotchedOutline | null; // assigned in initialize()
  private trailingIcon_!: MDCTextFieldIcon | null; // assigned in initialize()

  initialize(
      rippleFactory: RippleFactory = (el, foundation) => new MDCRipple(el, foundation),
      lineRippleFactory: LineRippleFactory = (el) => new MDCLineRipple(el),
      helperTextFactory: HelperTextFactory = (el) => new MDCTextFieldHelperText(el),
      characterCounterFactory: CharacterCounterFactory = (el) => new MDCTextFieldCharacterCounter(el),
      iconFactory: IconFactory = (el) => new MDCTextFieldIcon(el),
      labelFactory: LabelFactory = (el) => new MDCFloatingLabel(el),
      outlineFactory: OutlineFactory = (el) => new MDCNotchedOutline(el),
  ) {
    this.input_ = this.root_.querySelector<HTMLInputElement>(strings.INPUT_SELECTOR)!;

    const labelElement = this.root_.querySelector(strings.LABEL_SELECTOR);
    this.label_ = labelElement ? labelFactory(labelElement) : null;

    const lineRippleElement = this.root_.querySelector(strings.LINE_RIPPLE_SELECTOR);
    this.lineRipple_ = lineRippleElement ? lineRippleFactory(lineRippleElement) : null;

    const outlineElement = this.root_.querySelector(strings.OUTLINE_SELECTOR);
    this.outline_ = outlineElement ? outlineFactory(outlineElement) : null;

    // Helper text
    const helperTextStrings = MDCTextFieldHelperTextFoundation.strings;
    const nextElementSibling = this.root_.nextElementSibling;
    const hasHelperLine = (nextElementSibling && nextElementSibling.classList.contains(cssClasses.HELPER_LINE));
    const helperTextEl =
        hasHelperLine && nextElementSibling && nextElementSibling.querySelector(helperTextStrings.ROOT_SELECTOR);
    this.helperText_ = helperTextEl ? helperTextFactory(helperTextEl) : null;

    // Character counter
    const characterCounterStrings = MDCTextFieldCharacterCounterFoundation.strings;
    let characterCounterEl = this.root_.querySelector(characterCounterStrings.ROOT_SELECTOR);
    // If character counter is not found in root element search in sibling element.
    if (!characterCounterEl && hasHelperLine && nextElementSibling) {
      characterCounterEl = nextElementSibling.querySelector(characterCounterStrings.ROOT_SELECTOR);
    }
    this.characterCounter_ = characterCounterEl ? characterCounterFactory(characterCounterEl) : null;

    this.leadingIcon_ = null;
    this.trailingIcon_ = null;
    const iconElements = this.root_.querySelectorAll(strings.ICON_SELECTOR);
    if (iconElements.length > 0) {
      if (iconElements.length > 1) { // Has both icons.
        this.leadingIcon_ = iconFactory(iconElements[0]);
        this.trailingIcon_ = iconFactory(iconElements[1]);
      } else {
        if (this.root_.classList.contains(cssClasses.WITH_LEADING_ICON)) {
          this.leadingIcon_ = iconFactory(iconElements[0]);
        } else {
          this.trailingIcon_ = iconFactory(iconElements[0]);
        }
      }
    }

    const isTextArea = this.root_.classList.contains(cssClasses.TEXTAREA);
    const isOutlined = this.root_.classList.contains(cssClasses.OUTLINED);
    this.ripple = (isTextArea || isOutlined) ? null : rippleFactory(this.root_, new MDCRippleFoundation({
      ...MDCRipple.createAdapter(this),
      ...({
        // tslint:disable:object-literal-sort-keys
        isSurfaceActive: () => ponyfill.matches(this.input_, ':active'),
        registerInteractionHandler: (evtType, handler) => {
          return this.input_.addEventListener(evtType, handler);
        },
        deregisterInteractionHandler: (evtType, handler) => {
          return this.input_.removeEventListener(evtType, handler);
        },
        // tslint:enable:object-literal-sort-keys
      }),
    }));
  }

  destroy() {
    if (this.ripple) {
      this.ripple.destroy();
    }
    if (this.lineRipple_) {
      this.lineRipple_.destroy();
    }
    if (this.helperText_) {
      this.helperText_.destroy();
    }
    if (this.characterCounter_) {
      this.characterCounter_.destroy();
    }
    if (this.leadingIcon_) {
      this.leadingIcon_.destroy();
    }
    if (this.trailingIcon_) {
      this.trailingIcon_.destroy();
    }
    if (this.label_) {
      this.label_.destroy();
    }
    if (this.outline_) {
      this.outline_.destroy();
    }
    super.destroy();
  }

  /**
   * Initializes the Text Field's internal state based on the environment's
   * state.
   */
  initialSyncWithDom() {
    this.disabled = this.input_.disabled;
  }

  get value(): string {
    return this.foundation_.getValue();
  }

  /**
   * @param value The value to set on the input.
   */
  set value(value: string) {
    this.foundation_.setValue(value);
  }

  get disabled(): boolean {
    return this.foundation_.isDisabled();
  }

  /**
   * @param disabled Sets the Text Field disabled or enabled.
   */
  set disabled(disabled: boolean) {
    this.foundation_.setDisabled(disabled);
  }

  get valid(): boolean {
    return this.foundation_.isValid();
  }

  /**
   * @param valid Sets the Text Field valid or invalid.
   */
  set valid(valid: boolean) {
    this.foundation_.setValid(valid);
  }

  get required(): boolean {
    return this.input_.required;
  }

  /**
   * @param required Sets the Text Field to required.
   */
  set required(required: boolean) {
    this.input_.required = required;
  }

  get pattern(): string {
    return this.input_.pattern;
  }

  /**
   * @param pattern Sets the input element's validation pattern.
   */
  set pattern(pattern: string) {
    this.input_.pattern = pattern;
  }

  get minLength(): number {
    return this.input_.minLength;
  }

  /**
   * @param minLength Sets the input element's minLength.
   */
  set minLength(minLength: number) {
    this.input_.minLength = minLength;
  }

  get maxLength(): number {
    return this.input_.maxLength;
  }

  /**
   * @param maxLength Sets the input element's maxLength.
   */
  set maxLength(maxLength: number) {
    // Chrome throws exception if maxLength is set to a value less than zero
    if (maxLength < 0) {
      this.input_.removeAttribute('maxLength');
    } else {
      this.input_.maxLength = maxLength;
    }
  }

  get min(): string {
    return this.input_.min;
  }

  /**
   * @param min Sets the input element's min.
   */
  set min(min: string) {
    this.input_.min = min;
  }

  get max(): string {
    return this.input_.max;
  }

  /**
   * @param max Sets the input element's max.
   */
  set max(max: string) {
    this.input_.max = max;
  }

  get step(): string {
    return this.input_.step;
  }

  /**
   * @param step Sets the input element's step.
   */
  set step(step: string) {
    this.input_.step = step;
  }

  /**
   * Sets the helper text element content.
   */
  set helperTextContent(content: string) {
    this.foundation_.setHelperTextContent(content);
  }

  /**
   * Sets the aria label of the leading icon.
   */
  set leadingIconAriaLabel(label: string) {
    this.foundation_.setLeadingIconAriaLabel(label);
  }

  /**
   * Sets the text content of the leading icon.
   */
  set leadingIconContent(content: string) {
    this.foundation_.setLeadingIconContent(content);
  }

  /**
   * Sets the aria label of the trailing icon.
   */
  set trailingIconAriaLabel(label: string) {
    this.foundation_.setTrailingIconAriaLabel(label);
  }

  /**
   * Sets the text content of the trailing icon.
   */
  set trailingIconContent(content: string) {
    this.foundation_.setTrailingIconContent(content);
  }

  /**
   * Enables or disables the use of native validation. Use this for custom validation.
   * @param useNativeValidation Set this to false to ignore native input validation.
   */
  set useNativeValidation(useNativeValidation: boolean) {
    this.foundation_.setUseNativeValidation(useNativeValidation);
  }

  /**
   * Focuses the input element.
   */
  focus() {
    this.input_.focus();
  }

  /**
   * Recomputes the outline SVG path for the outline element.
   */
  layout() {
    // The trailing `|| false` is needed for a unit test to pass in IE 11.
    const openNotch = this.foundation_.shouldFloat || false;
    this.foundation_.notchOutline(openNotch);
  }

  getDefaultFoundation(): MDCTextFieldFoundation {
    return new MDCTextFieldFoundation({
      ...({
        // tslint:disable:object-literal-sort-keys
        addClass: (className) => this.root_.classList.add(className),
        removeClass: (className) => this.root_.classList.remove(className),
        hasClass: (className) => this.root_.classList.contains(className),
        registerTextFieldInteractionHandler: (evtType, handler) => this.root_.addEventListener(evtType, handler),
        deregisterTextFieldInteractionHandler: (evtType, handler) => this.root_.removeEventListener(evtType, handler),
        registerValidationAttributeChangeHandler: (handler) => {
          const getAttributesList = (mutationsList: MutationRecord[]): string[] => {
            return mutationsList
                .map((mutation) => mutation.attributeName)
                .filter((attributeName) => attributeName) as string[];
          };
          const observer = new MutationObserver((mutationsList) => handler(getAttributesList(mutationsList)));
          const config = {attributes: true};
          observer.observe(this.input_, config);
          return observer;
        },
        deregisterValidationAttributeChangeHandler: (observer) => observer.disconnect(),
        isFocused: () => document.activeElement === this.input_,
        // tslint:enable:object-literal-sort-keys
      }),
      ...this.getInputAdapterMethods_(),
      ...this.getLabelAdapterMethods_(),
      ...this.getLineRippleAdapterMethods_(),
      ...this.getOutlineAdapterMethods_(),
    }, this.getFoundationMap_());
  }

  private getLabelAdapterMethods_() {
    return {
      floatLabel: (shouldFloat: boolean) => this.label_ && this.label_.float(shouldFloat),
      getLabelWidth: () => this.label_ ? this.label_.getWidth() : 0,
      hasLabel: () => Boolean(this.label_),
      shakeLabel: (shouldShake: boolean) => this.label_ && this.label_.shake(shouldShake),
    };
  }

  private getLineRippleAdapterMethods_() {
    return {
      activateLineRipple: () => {
        if (this.lineRipple_) {
          this.lineRipple_.activate();
        }
      },
      deactivateLineRipple: () => {
        if (this.lineRipple_) {
          this.lineRipple_.deactivate();
        }
      },
      setLineRippleTransformOrigin: (normalizedX: number) => {
        if (this.lineRipple_) {
          this.lineRipple_.setRippleCenter(normalizedX);
        }
      },
    };
  }

  private getOutlineAdapterMethods_() {
    return {
      closeOutline: () => this.outline_ && this.outline_.closeNotch(),
      hasOutline: () => Boolean(this.outline_),
      notchOutline: (labelWidth: number) => this.outline_ && this.outline_.notch(labelWidth),
    };
  }

  private getInputAdapterMethods_() {
    // tslint:disable:object-literal-sort-keys
    return {
      registerInputInteractionHandler: <E extends EventType>(evtType: E, handler: SpecificEventListener<E>) => {
        return this.input_.addEventListener(evtType, handler);
      },
      deregisterInputInteractionHandler: <E extends EventType>(evtType: E, handler: SpecificEventListener<E>) => {
        return this.input_.removeEventListener(evtType, handler);
      },
      getNativeInput: () => this.input_,
    };
    // tslint:enable:object-literal-sort-keys
  }

  /**
   * @return A map of all subcomponents to subfoundations.
   */
  private getFoundationMap_(): Partial<FoundationMapType> {
    return {
      characterCounter: this.characterCounter_ ? this.characterCounter_.foundation : undefined,
      helperText: this.helperText_ ? this.helperText_.foundation : undefined,
      leadingIcon: this.leadingIcon_ ? this.leadingIcon_.foundation : undefined,
      trailingIcon: this.trailingIcon_ ? this.trailingIcon_.foundation : undefined,
    };
  }
}

export {MDCTextField as default, MDCTextField};
export * from './adapter';
export * from './foundation';
export * from './types';
export * from './character-counter/index';
export * from './helper-text/index';
export * from './icon/index';
