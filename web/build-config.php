<?php

define('NL',"\n");

//header('Content-Type: text/plain');

if ($argc < 2) die('The configuration type parameter is required');

$configType = $argv[1];

echo 'Building config file for ' . $configType . NL;

$mainPath = "./config/";
$secPath = $mainPath . $configType . '/';

$pathes = [ $mainPath, $secPath ];
$filesContent = [];

foreach( $pathes as $path )
{
    echo '- Treating dir ' . $path . NL;

    $dir = opendir($path);

    while ($file = readdir($dir))
    {
        echo '--- Treating file ' . $file . NL;
    
        if (($file != '.') && ($file != '..') && (!is_dir($path.$file)))
        {
            echo '--- Reading file content' . NL;
            $content = file_get_contents($path.$file) . NL . NL ;
            $content = str_replace('<?php','',$content);
            $filesContent[$file] = $content;
        }
    }

    closedir($dir);
}

ksort($filesContent);

$outputFileName = 'config.php';
$outputFile = fopen($outputFileName,'w');
fwrite($outputFile,'<?php ');

foreach ( $filesContent as $file => $content )
{
    fwrite($outputFile,NL . '/** From file ' . $file . ' **/');
    fwrite($outputFile,$content);
    echo 'File ' . $file . ' written' . NL;
}

fclose($outputFile);