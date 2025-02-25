const ApprovalLevels = require("../model/Approval_level");
const ApprovalTypes = require("../model/Approval_type");
const { Sequelize } = require("sequelize");
const Users = require('../model/Users')
class Approval {
  constructor() {
    this.approvalLevels = ApprovalLevels;
    this.approvalTypes = ApprovalTypes;
    this.users = Users
  }

  async createApprovalTypes(data) {
     await this.approvalTypes.create({
      approval_type: data.approvalType,
      total_number_of_approval: data.totalApprovals,
      service_id: data.service_id,
    });
    const user = await this.users.findOne({ where: { id: data.user_id } });
    if (user) {
        let newAuthStep = user.authStep;
        
        if (user.authStep === 5) {
            newAuthStep += 1;
        }
        await this.users.update({ authStep: newAuthStep }, { where: { id: data.user_id } });
    }
    return {
      success:true,
      message: "Approval Type added successfully"
    }
  }
  async updateApprovalType(id) {
     const approvalType = await this.approvalTypes.findByPk(id);
     if (!approvalType) {
       throw new Error("Approval type not found");
     }
    return await approvalType.update({
       approval_type: data.approvalType,
       total_number_of_approval: data.totalApprovals,
     });
  }

  async fetchApprovalTypes(service_id) {
    return await this.approvalTypes.findAll({
      where: { service_id: service_id },
      raw: true,
    });
  }

  async updateApprovalLevel(data) {
    const approvalType = await this.approvalTypes.findOne({
      where: { id: data.typeId },
    });

    if (!approvalType) {
      throw new Error("Approval type not found");
    }
    const { total_number_of_approval } = approvalType;

    const approvalLevel = await this.approvalLevels.findOne({
      where: { level_id: data.levelId },
      raw: true,
    });

    if (!approvalLevel) {
      throw new Error("Approval level not found");
    }

    const { sequence_number } = approvalLevel;

    if (sequence_number < total_number_of_approval) {
      approvalLevel.sequence_number += 1;
      await approvalLevel.save();

      return approvalLevel;
    } else {
      return { message: "Approval Process Already Completed" };
    }
  }
  async CheckApprovalLevel(data) {
    const { designation, application_type } = data;
    const level = await this.approvalLevels.findAll({
      where: {
        designation: designation,
        application_type: application_type,
      },
    });
    return level;
  }
  async endOnboarding(user_id) {
    return await this.users.update( { authStep: 14,
      ended_onboarding: true,
      finished_onboarding:true
     },
    { where: { id: user_id } } )
  }
}

module.exports = new Approval();
