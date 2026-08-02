# Settings Infra Shared Module

## Purpose
Provides the settings registry (registerFeatureSettings) and standard UI blocks (SettingsSection).

## Rules
- New features should register settings locally via their init.ts rather than modifying global configuration here.