$FilePath = if ($args.Count -gt 0) { $args[0] } else { "samples/hl7/order.orm.hl7" }
$HostName = if ($env:HL7_HOST) { $env:HL7_HOST } else { "127.0.0.1" }
$Port = if ($env:HL7_PORT) { [int]$env:HL7_PORT } else { 2575 }

$payload = Get-Content -Raw -Path $FilePath
$client = [System.Net.Sockets.TcpClient]::new($HostName, $Port)
$stream = $client.GetStream()
$bytes = [System.Text.Encoding]::UTF8.GetBytes(([char]0x0b) + $payload + ([char]0x1c) + ([char]0x0d))
$stream.Write($bytes, 0, $bytes.Length)
$stream.Flush()
$reader = New-Object System.IO.StreamReader($stream)
$reader.ReadToEnd()
$reader.Dispose()
$stream.Dispose()
$client.Dispose()