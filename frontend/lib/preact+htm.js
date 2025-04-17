// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

export * from '/vendor/preact.module.js';
export * from '/vendor/hooks.module.js';

import htm from '/vendor/htm.module.js';
import { h } from '/vendor/preact.module.js';

export const html = htm.bind(h);
