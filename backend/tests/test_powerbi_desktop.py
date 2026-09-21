import os
import pytest
from unittest.mock import patch

from backend.app.powerbi.desktop_validator import PowerBIDesktopValidator
from backend.app.powerbi.schemas import DesktopEnvironmentStatus


def test_detect_environment_runs_safely():
    validator = PowerBIDesktopValidator()
    status = validator.detect_environment()
    assert isinstance(status, DesktopEnvironmentStatus)
    assert isinstance(status.is_installed, bool)
    assert isinstance(status.can_launch, bool)
    assert isinstance(status.notes, str)
    assert len(status.notes) > 0


def test_detect_environment_with_env_override(tmp_path):
    fake_exe = tmp_path / "PBIDesktop.exe"
    fake_exe.write_text("fake binary")

    validator = PowerBIDesktopValidator()
    with patch.dict(os.environ, {"POWERBI_DESKTOP_PATH": str(fake_exe)}):
        status = validator.detect_environment()
        assert status.is_installed is True
        assert status.can_launch is True
        assert status.detection_method == "environment_variable"
        assert status.executable_path == str(fake_exe)


def test_launch_desktop_nonexistent_file():
    validator = PowerBIDesktopValidator()
    res = validator.launch_desktop("nonexistent_path_test.pbip")
    assert res["success"] is False
    assert "does not exist" in res["error"]


def test_launch_desktop_uninstalled(tmp_path):
    fake_pbip = tmp_path / "test.pbip"
    fake_pbip.write_text("{}")

    validator = PowerBIDesktopValidator()
    # Force detect_environment to return uninstalled and no file association
    with patch.object(
        validator,
        "detect_environment",
        return_value=DesktopEnvironmentStatus(
            is_installed=False,
            executable_path=None,
            can_launch=False,
            file_association_detected=False,
            notes="Not installed test",
        ),
    ):
        res = validator.launch_desktop(str(fake_pbip))
        assert res["success"] is False
        assert "not installed" in res["error"].lower()
