<?php
include('header.tpl');
?>

<script>
	var user = <?php echo $_SESSION['user']->toJSON(); ?>;
	var ENCRYPT_ENABLED = <?php echo (ENCRYPT_ENABLED ? 'true' : 'false'); ?>;
</script>

</head>
<body>

<div id="screen">
    <canvas class="scene-view" width="1024" height="600"></canvas>
    <div id="gui"></div>
</div>

</body>
</html>