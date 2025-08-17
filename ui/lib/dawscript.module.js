// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

await import('/dawscript_core/extra/web/dawscript.js');

const d = window['dawscript'];

export const connect = d.connect;
export const host = d.host;
export const TrackType = d.TrackType;

delete window['dawscript'];
