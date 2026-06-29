Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile('C:\Users\super\Documents\CCFA website\New images\9.png'); Write-Host "9.png: $($img.Width) x $($img.Height)"
