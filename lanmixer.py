#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
# SPDX-License-Identifier: MIT

import os
import sys


# Edit as necessary
def load_controller():
    from dawscript_core.extra.web import controller as web_ctrl
    from dawscript_core.util import dawscript_path

    frontend = dawscript_path("../frontend")

    web_ctrl.set_server_config(frontend, service_name="LAN Mixer")

    return web_ctrl


# Entry point for Ableton Live
def create_instance(c_instance):
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
    from dawscript_core.host import DawscriptControlSurface, main

    instance = DawscriptControlSurface(c_instance)
    main(load_controller(), instance)

    return instance


# Entry point for REAPER, Bitwig and CLI
if __name__ == "__main__":
    from dawscript_core.host import main

    main(load_controller(), globals())
