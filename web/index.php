<?php

require_once('../app/config.php');

//echo 'DSN: ' . DB_DSN;

$db = new PDO( DB_DSN, DB_USER, DB_PASS );
$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );
$db->setAttribute( PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ );
$db->exec('SET CHARACTER SET utf8');

echo '<html><head>';
echo '<meta charset="utf8">';
echo '</head>';
echo '<body>';

$minId = 0;
if (isset($_GET["minId"]))
{
    $minId = (int) $_GET["minId"];
}

var_dump($minId);
$query = $db->prepare('SELECT name,id FROM testtable WHERE id >= :id_min ' );

if ($query->execute(['id_min' => $minId]))
{
    $list = [];

    while($res = $query->fetch())
    {
        $res->id = (int) $res->id;
        $list[] = $res;
        var_dump($res);
    }
}
else
{
    //die(var_dump($query->errorInfo()));
}

echo '</body></html>';
