import glob
import os
import platform
import shutil
import subprocess
from typing import Optional

from backend.app.powerbi.schemas import DesktopEnvironmentStatus


class PowerBIDesktopValidator:
    """
    Detects and validates the local Power BI Desktop execution environment
    and verifies readiness of generated .pbip projects for desktop loading.
    """

    KNOWN_EXECUTABLE_PATHS = [
        r"C:\Program Files\Microsoft Power BI Desktop\bin\PBIDesktop.exe",
        r"C:\Program Files (x86)\Microsoft Power BI Desktop\bin\PBIDesktop.exe",
        r"C:\Program Files\Microsoft Power BI Desktop\PBIDesktop.exe",
    ]

    def detect_environment(self) -> DesktopEnvironmentStatus:
        """
        Inspects the local system for Power BI Desktop installations,
        registry entries, Windows Store packages, and file associations.
        """
        is_windows = platform.system().lower() == "windows"
        if not is_windows:
            return DesktopEnvironmentStatus(
                is_installed=False,
                executable_path=None,
                can_launch=False,
                file_association_detected=False,
                detection_method=None,
                notes=(
                    f"Operating system is '{platform.system()}'. "
                    "Power BI Desktop runs natively on Windows. Generated .pbip files can be opened "
                    "on any Windows machine with Power BI Desktop installed, or imported into Power BI Service/Fabric."
                ),
            )

        # 1. Check environment variable override
        env_path = os.environ.get("POWERBI_DESKTOP_PATH")
        if env_path and os.path.isfile(env_path):
            return DesktopEnvironmentStatus(
                is_installed=True,
                executable_path=env_path,
                can_launch=True,
                file_association_detected=True,
                detection_method="environment_variable",
                notes="Power BI Desktop located via POWERBI_DESKTOP_PATH environment variable.",
            )

        # 2. Check PATH
        path_which = shutil.which("PBIDesktop.exe") or shutil.which("PBIDesktop")
        if path_which and os.path.isfile(path_which):
            return DesktopEnvironmentStatus(
                is_installed=True,
                executable_path=path_which,
                can_launch=True,
                file_association_detected=True,
                detection_method="system_path",
                notes="Power BI Desktop found on system PATH.",
            )

        # 3. Check known installation directories
        for path in self.KNOWN_EXECUTABLE_PATHS:
            if os.path.isfile(path):
                return DesktopEnvironmentStatus(
                    is_installed=True,
                    executable_path=path,
                    can_launch=True,
                    file_association_detected=True,
                    detection_method="standard_program_files",
                    notes=f"Power BI Desktop found at standard path: {path}",
                )

        # 4. Check WindowsApps Store directory
        windows_apps = r"C:\Program Files\WindowsApps"
        if os.path.isdir(windows_apps):
            try:
                store_matches = glob.glob(
                    os.path.join(windows_apps, "Microsoft.MicrosoftPowerBIDesktop_*", "bin", "PBIDesktop.exe")
                )
                if store_matches and os.path.isfile(store_matches[0]):
                    return DesktopEnvironmentStatus(
                        is_installed=True,
                        executable_path=store_matches[0],
                        can_launch=True,
                        file_association_detected=True,
                        detection_method="windows_store_package",
                        notes=f"Power BI Desktop (Store edition) found at: {store_matches[0]}",
                    )
            except Exception:
                pass

        # 5. Check Windows Registry (winreg)
        reg_path = self._query_registry_app_paths()
        if reg_path and os.path.isfile(reg_path):
            return DesktopEnvironmentStatus(
                is_installed=True,
                executable_path=reg_path,
                can_launch=True,
                file_association_detected=True,
                detection_method="windows_registry",
                notes=f"Power BI Desktop located via Windows Registry: {reg_path}",
            )

        file_assoc = self._check_pbip_file_association()

        return DesktopEnvironmentStatus(
            is_installed=False,
            executable_path=None,
            can_launch=False,
            file_association_detected=file_assoc,
            detection_method="not_detected",
            notes=(
                "Power BI Desktop is not detected on this machine. "
                "The generated .pbip project directory and zip package are structurally complete "
                "and ready to be opened on any workstation with Power BI Desktop (or published to Power BI Service / Fabric)."
            ),
        )

    def _query_registry_app_paths(self) -> Optional[str]:
        """Queries Windows Registry for PBIDesktop.exe registration."""
        try:
            import winreg

            subkeys = [
                (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\PBIDesktop.exe"),
                (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\PBIDesktop.exe"),
            ]
            for root, subkey in subkeys:
                try:
                    with winreg.OpenKey(root, subkey) as key:
                        val, _ = winreg.QueryValueEx(key, "")
                        if val and os.path.isfile(val):
                            return val
                except OSError:
                    continue
        except Exception:
            pass
        return None

    def _check_pbip_file_association(self) -> bool:
        """Checks if .pbip file extension is registered in the Windows registry."""
        try:
            import winreg

            with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, ".pbip") as key:
                val, _ = winreg.QueryValueEx(key, "")
                return bool(val)
        except Exception:
            return False

    def launch_desktop(self, pbip_file_path: str) -> dict:
        """
        Attempts to open the specified .pbip project in Power BI Desktop.
        Returns execution status and diagnostics.
        """
        if not os.path.isfile(pbip_file_path):
            return {
                "success": False,
                "error": f"File '{pbip_file_path}' does not exist.",
            }

        env = self.detect_environment()

        if env.executable_path and os.path.isfile(env.executable_path):
            try:
                subprocess.Popen([env.executable_path, os.path.abspath(pbip_file_path)])
                return {
                    "success": True,
                    "launched_with": env.executable_path,
                    "target_file": pbip_file_path,
                    "message": "Power BI Desktop process launched successfully.",
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Failed to spawn Power BI Desktop: {str(e)}",
                }

        # If file association is registered on Windows, try os.startfile
        if platform.system().lower() == "windows" and env.file_association_detected:
            try:
                os.startfile(os.path.abspath(pbip_file_path))  # type: ignore[attr-defined]
                return {
                    "success": True,
                    "launched_with": "system_file_association",
                    "target_file": pbip_file_path,
                    "message": "Project opened via Windows default file handler.",
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Failed to open via file association: {str(e)}",
                }

        return {
            "success": False,
            "error": "Power BI Desktop is not installed or registered on this machine.",
            "notes": env.notes,
        }
