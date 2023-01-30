<?php

$bytes = [];
$bytes_read = 0;
//while(!feof(STDIN)) {
while(($b = fgetc(STDIN)) !== false) {
    //$b = fread(STDIN, 1);
    $bytes[] = ord($b);
    $bytes_read++;
}

fwrite(STDERR, "bytes read:" . $bytes_read . PHP_EOL);

echo "let romArray = [", PHP_EOL;
echo implode(',', $bytes), PHP_EOL;
echo "];", PHP_EOL;
echo "export { romArray };", PHP_EOL;
