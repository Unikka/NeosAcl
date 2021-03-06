<?php
namespace Sandstorm\NeosAcl\Domain\Model;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Neos\Flow\Annotations as Flow;
use Doctrine\ORM\Mapping as ORM;

/**
 * @Flow\Entity
 */
class DynamicRole
{

    /**
     * @var string
     */
    protected $name;

    /**
     * @var boolan
     */
    protected $abstract;

    /**
     * @ORM\Column(type="flow_json_array")
     * @var array<string>
     */
    protected $parentRoleNames;

    /**
     * @ORM\Column(type="flow_json_array")
     * @var array
     */
    protected $matcher = [];

    const PRIVILEGE_VIEW = 'view';
    const PRIVILEGE_VIEW_EDIT = 'edit';
    const PRIVILEGE_VIEW_EDIT_CREATE_DELETE = 'edit_create_delete';

    /**
     * @var string
     */
    protected $privilege = self::PRIVILEGE_VIEW;

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return boolan
     */
    public function getAbstract()
    {
        return $this->abstract;
    }

    /**
     * @param boolan $abstract
     */
    public function setAbstract($abstract)
    {
        $this->abstract = $abstract;
    }

    /**
     * @return array
     */
    public function getParentRoleNames()
    {
        return $this->parentRoleNames;
    }

    /**
     * @param array $parentRoleNames
     */
    public function setParentRoleNames($parentRoleNames)
    {
        $this->parentRoleNames = $parentRoleNames;
    }

    /**
     * @return array
     */
    public function getPrivileges()
    {
        return $this->privileges;
    }

    /**
     * @param array $privileges
     */
    public function setPrivileges($privileges)
    {
        $this->privileges = $privileges;
    }
}
