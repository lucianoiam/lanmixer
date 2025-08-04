#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
# SPDX-License-Identifier: MIT

import os
import sys


def load_controller():
    from dawscript_core.extra.web import controller as web_ctrl
    from dawscript_core.util import dawscript_path

    htdocs = dawscript_path("../../ui")
    web_ctrl.set_server_config(htdocs, service_name="LAN Mixer", inject_js=False)

    return web_ctrl


def create_instance(c_instance):
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
    from dawscript_core.host import DawscriptControlSurface, main

    instance = DawscriptControlSurface(c_instance)
    main(load_controller(), instance)

    return instance


if __name__ == "__main__":
    from dawscript_core.host import main

    main(load_controller(), globals())
