import {
  Component, OnInit, ElementRef, Input, ViewChild,
  forwardRef, SimpleChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as editor from 'jsoneditor';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'json-editor',
  template: '<div #jsonEditorContainer></div>',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => JsonEditorComponent),
    multi: true
  }]
})

export class JsonEditorComponent implements OnInit, ControlValueAccessor {
  private editor: any;

  @ViewChild('jsonEditorContainer') jsonEditorContainer: ElementRef;

  private _data: Object = {};

  @Input() options: JsonEditorOptions = new JsonEditorOptions();
  @Input('data')

  onChangeCallback;

  set data(value: Object) {
    this._data = value;
    if (this.editor) {
      this.editor.destroy();
      this.ngOnInit();
    }
  }

  registerOnChange(fn) { this.onChangeCallback = fn; }

  registerOnTouched(fn) {  }

  writeValue(value) {
    this.set(value)
  }

  constructor() {
  }

  ngOnInit() {
    if (!this.options.onChange) {
      var _this = this
      this.options.onChange = function () {
        try {
	  // Currently, this fetches the text-only representation so
	  // that a separate angular validation step can determine if
	  // it is valid json. This has the advantage of not throwing
	  // exceptions when fetching the data, but requires the
	  // parent form validate the json. An alternative approch
	  // would be to silently not update the form value until it
	  // is valid json, but that makes doing form validation as
	  // more difficult when using reactive form validation.
          _this.onChangeCallback(_this.editor.getText())
        }
        catch(e) {}
      }
    }
    this.editor = new editor(this.jsonEditorContainer.nativeElement, this.options, this._data);
  }

  public collapseAll() {
    this.editor.collapseAll();
  }

  public expandAll() {
    this.editor.expandAll();
  }

  public focus() {
    this.editor.focus();
  }

  public get(): JSON {
    return this.editor.get();
  }

  public getMode(): JsonEditorMode {
    return this.editor.getMode() as JsonEditorMode;
  }

  public getName(): string {
    return this.editor.getName();
  }

  public getText(): string {
    return this.editor.getText();
  }

  public set(value: JSON | string) {
    switch(typeof value) {
      case "string":
        return this.editor.setText(value);
      case "object":
        return this.editor.set(value);
      default:
        throw new Error("set called with unexpected type: " + (typeof value))
    }
  }

  public setMode(mode: JsonEditorMode) {
    this.editor.setMode(mode);
  }

  public setName(name: string) {
    this.editor.setName(name);
  }

  public setSchema(schema: any) {
    this.editor.setSchema(schema);
  }

  public setOptions(newOptions: JsonEditorOptions) {
    if (this.editor) {
      this.editor.destroy();
    }
    this.options = newOptions;
    this.ngOnInit();
  }

  public destroy() {
    this.editor.destroy();
  }
}

export type JsonEditorMode = 'tree' | 'view' | 'form' | 'code' | 'text';

export interface JsonEditorTreeNode {
  field: String,
  value: String,
  path: String[]
}

export class JsonEditorOptions {
  public ace: Object;
  public ajv: Object;
  public onChange: () => void;
  public onEditable: (node: JsonEditorTreeNode | {}) => boolean | { field: boolean, value: boolean };
  public onError: (error: any) => void;
  public onModeChange: (newMode: JsonEditorMode, oldMode: JsonEditorMode) => void;
  public escapeUnicode: boolean;
  public sortObjectKeys: boolean;
  public history: boolean;
  public mode: JsonEditorMode;
  public modes: JsonEditorMode[];
  public name: String;
  public schema: Object;
  public search: boolean;
  public indentation: Number;
  public theme: Number;
  public language: String;
  public languages: Object;

  constructor() {
    this.escapeUnicode = false;
    this.sortObjectKeys = false;
    this.history = true;
    this.mode = 'tree';
    this.search = true;
    this.indentation = 2;
  }

}
