// 在ts中导入export = x 的模块定义
import trimStart = require('lodash/trimStart');
import trim = require('lodash/trim');

type Section = {
  leaf: boolean;
  mapping: Record<string, Section>;
};

// type Table = {
//   size: number;
//   root: Section;
// };

type Result<T = string[]> = { success: boolean; msg?: string; data?: T };

export class UtilsUrltable {
  empty = '';
  fuzzy = '*';
  omitted = '**';
  delimiter = '/';
  methodView = 'VIEW';

  //
  size = 0;
  root = {
    leaf: false,
    mapping: {},
  };

  // parse and validate pattern
  parse(p: string): Result {
    const format = '[get, post, put, patch, delete, view]/{a-Z}+/{*}+/{**}';
    const pattern = trimStart(trim(p), this.delimiter);
    if (pattern === '') {
      return {
        success: false,
        msg: 'pattern illegal, should in format of ' + format,
      };
    }
    let paths = pattern.split(this.delimiter);
    if (paths.length < 2) {
      return {
        success: false,
        msg: 'pattern illegal, should in format of ' + format,
      };
    }
    paths = paths.map((m) => trim(m));
    // likes get/ get/* get/**
    if (
      paths.length === 2 &&
      (paths[1] == this.empty ||
        paths[1] == this.fuzzy ||
        paths[1] == this.omitted)
    ) {
      return {
        success: false,
        msg: 'illegal wildcard',
      };
    }
    paths[0] = paths[0].toUpperCase();
    switch (paths[0]) {
      case 'GET':
      case 'POST':
      case 'PUT':
      case 'PATCH':
      case 'DELETE':
      case this.methodView:
        break;
      default:
        return {
          success: false,
          msg: `only supports [GET POST PUT PATCH DELETE ${this.methodView}]`,
        };
    }
    for (let k = 1; k < paths.length; k++) {
      if (paths[k] == this.empty && k + 1 != paths.length) {
        return {
          success: false,
          msg: `pattern contains illegal empty path`,
        };
      }

      if (paths[k] == this.omitted && k + 1 != paths.length) {
        return {
          success: false,
          msg: `pattern contains illegal omitted path`,
        };
      }
    }
    return {
      success: true,
      data: paths,
    };
  }

  //
  newSection(): Section {
    return {
      leaf: false,
      mapping: {},
    };
  }

  //
  append(pattern: string): Result {
    const parseResult = this.parse(pattern);
    if (!parseResult.success) {
      return parseResult;
    }
    const paths = parseResult.data;
    let insert = false;
    let root = this.root;
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (
        (path == this.fuzzy && root.mapping[this.omitted] != null) ||
        (path == this.omitted && root.mapping[this.fuzzy] != null) ||
        (path != this.omitted && root.mapping[this.omitted] != null)
      ) {
        return {
          success: false,
          msg: `conflict at ${paths.slice(0, i).join(this.delimiter)}`,
        };
      }
      let next = root.mapping[path];
      if (next == null) {
        next = this.newSection();
        root.mapping[path] = next;
        insert = true;
      }
      root = next;
    }
    if (insert) {
      this.size += 1;
    }
    root.leaf = true;
    return {
      success: true,
    };
  }

  // Mapping url to pattern
  mapping(url: string): Result<any> {
    const parseResult = this.parse(url);
    if (!parseResult.success) {
      return parseResult;
    }
    const paths = parseResult.data;
    const pattern = [];
    let root = this.root;
    for (let path of paths) {
      let next = root.mapping[path];
      if (next == null) {
        const nextFuzzy = root.mapping[this.fuzzy];
        const nextOmitted = root.mapping[this.omitted];
        if (nextFuzzy == null && nextOmitted == null) {
          return {
            success: true,
            data: '',
          };
        }
        if (nextOmitted != null) {
          pattern.push(this.omitted);
          return {
            success: true,
            data: pattern.join(this.delimiter),
          };
        }
        next = nextFuzzy;
        path = this.fuzzy;
      }
      root = next;
      pattern.push(path);
    }
    if (root.leaf) {
      return {
        success: true,
        data: pattern.join(this.delimiter),
      };
    }
    return {
      success: true,
      data: '',
    };
  }
}
